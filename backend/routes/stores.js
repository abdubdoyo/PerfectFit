const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config(); 
const multer = require('multer'); 
const upload = multer(); 
const {analyzeClothingImage, findNearbyStoresAI} = require('../imageMatcher'); 
const GOOGLE_KEY = process.env.GOOGLE_PLACE_KEY;
const {GoogleGenerativeAI} = require('@google/generative-ai'); 

const KNOWN_CLOTHING_BRANDS = ['H&M', 'Uniqlo', 'Zara', 'Bluenotes', 'Banana Republic', 'Forever 21', 'Guess', 'Lee Cooper', 'Adidas', 'Nike', 'Puma', 'Lululemon', 'Winners', 'Hollister', 'Abercrombie & Fitch', 'Gap', 'Old Navy', 'Express', 'Marshalls', 'Pull & Bear', 'Armani Exchange', 'Polo', 'Calvin Klein', 'Cotton On', 'Giordano', 'Essentials']; 


if (!GOOGLE_KEY) {
    console.error("FATAL: Google Places API key not configured!");
    process.exit(1);
}
  
console.log("Using Google API Key:", GOOGLE_KEY ? "***REDACTED***" : "MISSING");
  
// Distance calculation function 
function haversine(lat1, lon1, lat2, lon2){
    const R = 6371000;
    const toRad = (x) => (x * Math.PI) / 180;
  
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
  
    const a = 
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
  
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
        return R * c;
}

router.post('/api/recommendations', upload.single('image'), async (req, res) => {
    console.log('Received request with body:', req.body);
        
    try {
        const {size, lat, lng} = req.body; // Removed await since req.body doesn't need it
        const image = req.file; 
    
        if (!size || !lat || !lng) {
            console.error('Missing parameters:', { size, lat, lng });
            return res.status(400).json({ error: 'Missing size or coordinates' });
        }

        if (!image) { 
            console.error('No image uploaded.'); 
            return res.status(400).json({error: 'No clothing image provided'}); 
        }

        console.log(`Searching nearby stores based on your location: ${lat, lng}`); 

        // Step 1: Allow AI to analyze the image that we uploaded
        const clothingAnalysis = await analyzeClothingImage(image.buffer); 
        console.log('Clothing analysis results: ', clothingAnalysis); 

        // Step 2: Find the close known clothing brand stores based on the user's location with AI 
        const stores = await findNearbyStoresAI(lat, lng, KNOWN_CLOTHING_BRANDS); 

        if (!stores || stores.length === 0) { 
            console.log('No stores found'); 
            return res.status(404).json({error: 'No clothing stores found nearby'}); 
        }

        // Step 3: Match stores with inventory based on image analysis
        const recommendations = await Promise.all(
            stores.map(async store => { 
                try { 
                    const inventory = await simulateInventoryMatch(store.name, clothingAnalysis); 

                    return { 
                        store, 
                        matches: inventory.items
                    }; 
                }
                catch (error) { 
                    console.error(`Error checking ${store.name}:`, error); 
                    return { 
                        store, 
                        matches: []
                    }; 
                }
            })
        ); 

        // Filter the stores with matches and sort by distance 
        const filtered = recommendations.filter(rec => rec.matches.length > 0).sort((a,b) => a.store.distanceMeters - b.store.distanceMeters); 

        res.json({
            clothingAnalysis, 
            recommendations: filtered.slice(0,5)
        }); 
    }
    catch (error) {
        console.error('Failed to get recommendations.'); 
        res.status(500).json({error: 'Failed to get recommendations.'})
    }

}); 


async function simulateInventoryMatch(storeName, clothingAnalysis) { 
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 
    
    const modelAI = genAI.getGenerativeModel({model: 'gemini-pro'}); 

    try { 
        const prompt = `You are an advanced clothing iventory matching system.
        I want you to check this store ${storeName} and check if this ${JSON.stringify(clothingAnalysis)} clothes is available in the store.

        I need to know if that store has that particular clothing analysis.
        
        Return response in JSON format with these fields: 
            "items": [{
                "name": string (exact clothing name), 
                "brand": string (brand name), 
            }]
        
        Rules: 
        1. Only include items that would realistically be in ${storeName}
        2. Only return the specified JSON structure 
        3. Do not include any explanations or additional fields
        4. If no matches, return empty items array
        `; 

        const response = await modelAI.generateContent(request); 
        const responseText = response.response.text(); 

        // Extract JSON from markdown if needed
        const jsonStart = responseText.indexOf('{'); 
        const jsonEnd = responseText.indexOf('}') + 1; 
        const jsonString = responseText.slice(jsonStart, jsonEnd); 

        const inventory = JSON.parse(jsonString); 

        // Validate and return only the required fields
        return { 
            items: (inventory.items || []).map(item => ({
                name: item.name || 'Unknown', 
                brand: item.brand || 'Unkown'
            }))
        }; 

    }
    catch (error) { 
        console.error('AI inventory check failed: ', error); 
        return {items: []}; 
    }
}

module.exports = router; 