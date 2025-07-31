const {GoogleGenerativeAI} = require('@google/generative-ai'); 
require('dotenv').config(); 
const axios = require('axios'); 

// Initialize the AI 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 

const modelAI = genAI.getGenerativeModel({model: 'gemini-1.5-flash'}); 

async function analyzeClothingImage(imageBuffer) { 
    try { 
        const prompt = `Analyzs ONLY THE TOP/UPPER BODY clothing based on the image I am providing you. Ignore all lower body attire. Provide details in this exact JSON format: 
            { 
                "color": string, (primary color)
                "brand": string (if recognizable), 
                "style": string (casual/formal/sporty), 
                "pattern": string (solid, striped, printed), 
                "type": string (shirt/blouse/t-shirt/hoodie), 
                "sleeveLength": string (short/long/sleeveless), 
                "neckline": string (round/v-neck)
            }

            Return ONLY this JSON object with no other text, explanation.  
        `; 

        const request = { 
            contents: [{
                parts: [
                    {text: prompt}, 
                    {inlineData: {
                        mimeType: 'image/jpeg', 
                        data: imageBuffer.toString('base64')
                    }}
                ]
            }]
        }; 

        const result = await modelAI.generateContent(request); 
        const response = await result.response; 
        const responseText = await response.text(); 

        if (!responseText) { 
            throw new Error('Empty response from AI model'); 
        }

        let cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim(); 

        const jsonStart = cleanedResponse.indexOf('{'); 
        const jsonEnd = cleanedResponse.lastIndexOf('}') + 1; 

        if (jsonStart === -1 || jsonEnd === 0) { 
            throw new Error('No JSON found in response'); 
        }

        const jsonString = cleanedResponse.slice(jsonStart, jsonEnd); 

        return JSON.parse(jsonString); 
    }
    catch (error) { 
        console.error('Image analysis error', error); 
        throw error; 
    }
}


async function findNearbyStoresAI(latitude, longitude, brandStores) {
    try {
        // 1. First try branded searches
        const brandedResults = await Promise.all(
            brandStores.map(brand => 
                axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
                    params: {
                        input: brand,
                        inputtype: 'textquery',
                        locationbias: `circle:10000@${latitude},${longitude}`,
                        fields: 'name,formatted_address,geometry',
                        key: process.env.GOOGLE_PLACE_KEY
                    },
                    timeout: 5000
                }).catch(e => {
                    console.warn(`Brand search failed for ${brand}:`, e.message);
                    return null;
                })
            )
        );

        // 2. Then try general clothing store search
        let generalResults = [];
        try {
            const response = await axios.get(
                'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
                {
                    params: {
                        location: `${latitude},${longitude}`,
                        radius: 5000, // Reduced radius for better results
                        type: 'clothing_store',
                        key: process.env.GOOGLE_PLACE_KEY
                    },
                    timeout: 5000
                }
            );
            generalResults = response.data.results || [];
        } catch (error) {
            console.error('General store search failed:', error.response?.data || error.message);
        }

        // 3. Combine and process results
        const allStores = [
            ...brandedResults.filter(Boolean).flatMap(r => r.data?.candidates || []),
            ...generalResults
        ];

        return allStores.map(store => ({
            id: store.place_id,
            name: store.name,
            address: store.formatted_address || store.vicinity,
            location: {
                lat: store.geometry?.location?.lat,
                lng: store.geometry?.location?.lng
            },
            distance: haversine(
                latitude,
                longitude,
                store.geometry?.location?.lat,
                store.geometry?.location?.lng
            ),
            rating: store.rating,
            types: store.types || []
        })).filter(store => store.name); // Filter out invalid entries

    } catch (error) {
        console.error('Store search failed completely:', error);
        return []; // Return empty array instead of throwing
    }
}

function haversine(lat1, lon1, lat2, lon2) {
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


// Updated getStoreDetails with better error handling
async function getStoreDetails(placeId) {
    if (!placeId) return {};
    
    try {
        const response = await axios.get(
            'https://maps.googleapis.com/maps/api/place/details/json',
            {
                params: {
                    place_id: placeId,
                    fields: 'opening_hours,rating,user_ratings_total,types',
                    key: process.env.GOOGLE_PLACE_KEY
                },
                timeout: 3000
            }
        );
        return response.data.result || {};
    } catch (error) {
        console.warn(`Failed to get details for place ${placeId}`);
        return {};
    }
}



module.exports = {analyzeClothingImage, findNearbyStoresAI}; 