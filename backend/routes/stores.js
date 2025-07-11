const express = require('express');
const axios = require('axios');
const router = express.Router();
const checkStoreInventory = require('./geminiCheckStore'); 
require('dotenv').config(); 

const GOOGLE_KEY = process.env.GOOGLE_PLACE_KEY;

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
router.post('/api/recommendations', async (req, res) => {
    console.log('Received request with body:', req.body);
    
    try {
        const { size, lat, lng } = req.body; // Removed await since req.body doesn't need it

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

        const ranked = stores.sort((a, b) => a.distanceMeters - b.distanceMeters);
        const results = ranked.slice(0, 10);
        
        const filtered = [];
        for(const store of results ){
            const check = await checkStoreInventory(store.name, size);
            if(check.hasSize){
                filtered.push({...store, url: check.url});
            }
        }
        console.log(`Returning ${results.length} stores`);
        res.json(filtered);
    }
    catch (err) {
        console.error('Full error:', err);
        if (err.response) {
            console.error('Google API response error:', err.response.data);
        }
        res.status(500).json({ 
            error: 'Failed to get store recommendations',
            details: err.message 
        });
    }
});

async function findNearbyStores(lat, lng) {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=clothing_store&key=${GOOGLE_KEY}`;
    
    console.log('Making Google Places API request to:', url);
    const { data } = await axios.get(url);
    
    if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status}`);
    }

    return data.results.map(r => ({
        placeId: r.place_id,
        name: r.name,
        address: r.vicinity,
        rating: r.rating,
        distanceMeters: haversine(
            lat, lng,
            r.geometry.location.lat,
            r.geometry.location.lng
        ),
        // Convert meters to miles for frontend
        distance: (haversine(
            lat, lng,
            r.geometry.location.lat,
            r.geometry.location.lng
        ) * 0.000621371).toFixed(1) // meters to miles
    }));
}



module.exports = router;