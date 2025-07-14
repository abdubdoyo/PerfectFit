const express = require('express');
const axios = require('axios');
const router = express.Router();
const checkStoreInventory = require('./geminiCheckStore'); 
require('dotenv').config(); 
const multer = require('multer'); 
const upload = multer(); 
const GOOGLE_KEY = process.env.GOOGLE_PLACE_KEY;

const KNOWN_CLOTHING_BRANDS = ['H&M', 'Uniqlo', 'Zara', 'Bluenotes', 'Gap', 'Old Navy', 'Banana Republic', 'Forever 21', 'American Eagle', 'Lululemon', 'Aritzia', 'Urban Outfitters', 'Hollister', 'Express', 'J.Crew', 'Nordstorm', 'Marshalls', 'Winners', 'TJ Maxx', 'Aritzia', 'Abercrombie & Fitch', 'Adidas', 'Nike', 'Puma', 'Guess'
]; 

if (!GOOGLE_KEY) {
  console.error("FATAL: Google Places API key not configured!");
  process.exit(1);
}

console.log("Using Google API Key:", GOOGLE_KEY ? "***REDACTED***" : "MISSING");

// ... keep your existing haversine function ...
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

// Add detailed error logging
router.post('/api/recommendations', upload.single('image'), async (req, res) => {
    console.log('Received request with body:', req.body);
    
    try {
        const { size, lat, lng} = req.body; // Removed await since req.body doesn't need it
        const image = req.file; 

        if (!size || !lat || !lng) {
            console.error('Missing parameters:', { size, lat, lng });
            return res.status(400).json({ error: 'Missing size or coordinates' });
        }

        console.log(`Searching stores near ${lat},${lng} for size ${size}`);
        const stores = await findNearbyStores(lat, lng);

        if (!stores || stores.length === 0) {
            console.log('No stores found');
            return res.status(404).json({ error: 'No clothing stores found nearby' });
        }

        const filtered = results.filter(store => 
            store.hasSize && (!image || store.imageMatch)
        ); 

        if (image) { 
            filtered.sort((a,b) => b.matchConfidence - a.matchConfidence); 
        }
        else { 
            filtered.sort((a,b) => a.distanceMeters - b.distanceMeters); 
        }
        res.json(filtered.slice(0,5));  
    }
    catch (err) {
        console.error('Recommendation error:', err);
        res.status(500).json({ 
            error: 'Failed to get store recommendations',
            details: err.message 
        });
    }
});

async function findNearbyStores(lat, lng) {
    async function findNearbyStores(lat, lng) {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&type=clothing_store&key=${GOOGLE_KEY}`;
        
        console.log('Making Google Places API request to:', url);
        
        try {
          const { data } = await axios.get(url);
          
          if (data.status !== 'OK') {
            console.error('Google Places API error:', data.status);
            return [];
          }
      
          if (!data.results || !Array.isArray(data.results)) {
            console.error('Invalid API response format - missing results array');
            return [];
          }
      
          // Process and filter stores
          const validStores = data.results
            .filter(store => {
              // Validate required fields exist
              return store && 
                     store.place_id && 
                     store.name && 
                     store.vicinity && 
                     store.geometry && 
                     store.geometry.location;
            })
            .filter(store => 
              KNOWN_CLOTHING_BRANDS.some(brand =>
                store.name.toLowerCase().includes(brand.toLowerCase())
              )
            )
            .map(store => {
              // Calculate distance
              const distanceMeters = haversine(
                lat, lng,
                store.geometry.location.lat,
                store.geometry.location.lng
              );
              
              return {
                placeId: store.place_id,
                name: store.name,
                address: store.vicinity,
                rating: store.rating || 0, // Default to 0 if no rating
                distanceMeters: distanceMeters,
                distance: (distanceMeters * 0.000621371).toFixed(1) + ' miles'
              };
            });
      
          console.log(`Found ${validStores.length} valid stores`);
          return validStores;
      
        } catch (err) {
          console.error('Full error fetching stores:', err);
          if (err.response) {
            console.error('Google API response error:', err.response.data);
          }
          return [];
        }
    }      
}

module.exports = router;