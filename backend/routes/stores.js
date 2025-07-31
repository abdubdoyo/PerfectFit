const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config(); 
const multer = require('multer'); 
const upload = multer(); 
const {analyzeClothingImage, findNearbyStoresAI} = require('../imageMatcher'); 
const GOOGLE_KEY = process.env.GOOGLE_PLACE_KEY;
const {GoogleGenerativeAI} = require('@google/generative-ai'); 
const { generateStoreUrl } = require('../storeUrls');
const { getCountryFromCoordinates } = require('../geocode');

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

        // Step 2: Detect country 
        const country = await getCountryFromCoordinates(lat, lng);

        // Step 3: Find the close known clothing brand stores based on the user's location with AI 
        const stores = await findNearbyStoresAI(lat, lng, KNOWN_CLOTHING_BRANDS); 
        console.log('Found stores:', stores); 

        if (!stores || stores.length === 0) { 
            console.log('No stores found'); 
            return res.status(404).json({error: 'No clothing stores found nearby'}); 
        }
        
        // Step 4: Generate all store URLs in one batch 
        const storesWithUrls = await generateStoreUrl(stores, clothingAnalysis, country); 

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


async function simulateInventoryMatch(url) { 
    const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY; 

    if (!SCRAPER_API_KEY) { 
        throw new Error('Scrapper API key missing'); 
    }

    const response = await axios.get('https://api.scraperapi.com', { 
        params: { 
            api_key: SCRAPER_API_KEY, 
            url, 
            render: true, 
            timeout: 30000, 
        }
    }); 

    return parseStoreHtml(storeName, response.data); 
}


module.exports = router; 