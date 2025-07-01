const express = require('express'); 
const axios = require('axios'); 
const router = express.Router(); 

router.post('/api/recommendations', async (req, res)=> { 
    try { 
        const {size, lat, lng} = await req.body; 

        if (!size || !lat || !lng) { 
            return res.status(400).json({error: 'Missing size or coordinates'}); 
        }

        const stores = await findNearbyStores(lat, lng); 
        const enriched = await Promise.all(
            stores.map(async (s) => ({ 
                ...s, 
                stock: await checkStoreStock(s, size)
            }))
        ); 

        const ranked = enriched.sort((a, b) => { 
            if (a.stock.inStock !== b.stock.inStock) return a.stock.inStock ? -1 : 1;
            return a.distanceMeters - b.distanceMeters;
        }); 

        res.json(ranked.slice(0, 10)); 
    }
    catch (err) { 
        console.error(err); 
        res.status(500).json({error: 'Failed to match error recommendations'}); 
    }
}); 