const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config(); 
const multer = require('multer'); 
const upload = multer(); 
const {analyzeClothingImage, findNearbyStoresAI} = require('../imageMatcher'); 
const GOOGLE_KEY = process.env.GOOGLE_PLACE_KEY;
const {GoogleGenAI } = require('@google/genai'); 
const { generateStoreUrl } = require('../storeUrls');
const { getCountryFromCoordinates } = require('../geocode');
const { parseStoreHtml } = require('../htmlParser');

const KNOWN_CLOTHING_BRANDS = ['H&M', 'Uniqlo', 'Zara', 'Bluenotes', 'Banana Republic', 'Forever 21', 'Guess', 'Lee Cooper', 'Adidas', 'Nike', 'Puma', 'Lululemon', 'Winners', 'Hollister', 'Abercrombie & Fitch', 'Gap', 'Old Navy', 'Express', 'Marshalls', 'Pull & Bear', 'Armani Exchange', 'Polo', 'Calvin&Klein', 'Cotton On', 'Giordano', 'Essentials', 'West49', 'Off-White', 'Supreme', 'Bershka', 'Shein', 'Roots', 'Mango', 'Frank and Oak', 'Aritzia', 'Lacoste', 'New Balance', 'Bathing Ape', 'Alo', 'Gymshark', 'Champion', ]; 


if (!GOOGLE_KEY) {
    console.error("FATAL: Google Places API key not configured!");
    process.exit(1);
}
  
if (!process.env.GOOGLE_PLACE_KEY || process.env.GOOGLE_PLACE_KEY.includes('YOUR_KEY')) {
    console.error("Invalid Google Places API key configuration!");
    process.exit(1);
}

console.log("Google Places API key is configured correctly.");
console.log("Using Google API Key:", GOOGLE_KEY ? "***REDACTED***" : "MISSING");
  
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
        let clothingAnalysis = null;
        try {
            clothingAnalysis = await analyzeClothingImage(image.buffer); 
            console.log('Clothing analysis results: ', clothingAnalysis); 
        } catch (error) {
            console.error('Image analysis failed:', error.message);
            clothingAnalysis = { 
                type: 'shirt', 
                color: 'unknown', 
                style: 'casual',
                brand: 'unknown',
                pattern: 'solid',
                sleeveLength: 'short',
                neckline: 'round'
            }; // fallback with all required properties
        } 

        // Step 2: Detect country 
        const country = await getCountryFromCoordinates(lat, lng);

        // Step 3: Find the close known clothing brand stores based on the user's location with AI 
        const stores = await findNearbyStoresAI(lat, lng, KNOWN_CLOTHING_BRANDS); 
        console.log('Found stores:', stores); 

        if (!stores || stores.length === 0) { 
            console.log('No stores found'); 
            return res.status(404).json({error: 'No clothing stores found nearby'}); 
        }

        // Cap to 10 stores to limit processing
        const cappedStores = stores.slice(0, 10);
        
        // Step 4: Generate all store URLs in one batch 
        const storesWithUrls = await generateStoreUrl(cappedStores, clothingAnalysis, country); 

        // Step 5: Check inventory only for stores with valid URLs 
        const recommendations = await Promise.all(
            storesWithUrls.map(async store => { 
                if (!store.searchUrl) return { store, matches: [] }; 

                try { 
                    const inventory = await simulateInventoryMatch(store.name, store.searchUrl); 
                    return { store, matches: inventory.items };  
                }
                catch (error) { 
                    console.error(`Scraping failed for ${store.name}:`, error); 
                    return { store, matches: [] }; 
                }
            })
        ); 

        // Filter and sort results 
        const filtered = recommendations.filter(r => r.matches.length > 0).sort((a,b) => a.store.distance - b.store.distance); 

        res.json({
            clothingAnalysis, 
            recommendations: filtered.slice(0, 5), 
            country
        }); 

    }
    catch (error) {
        console.error('Failed to get recommendations.', error); 
        res.status(500).json({error: 'Failed to get recommendations.'})
    }

}); 

async function simulateInventoryMatch(storeName, url) { 
    const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY; 

    if (!SCRAPER_API_KEY) { 
        throw new Error('Scrapper API key missing'); 
    }

    try {
        const response = await axios.get('https://api.scraperapi.com', { 
            params: { 
                api_key: SCRAPER_API_KEY, 
                url, 
                render: true, 
                timeout: 30000, 
            }
        }); 

        return parseStoreHtml(storeName, response.data); 
    } catch (error) {
        if (error.response && error.response.status === 404) {
            // URL not found, return empty results
            return { store: storeName, items: [] };
        }
        throw error; // Re-throw other errors
    }
}


module.exports = router; 