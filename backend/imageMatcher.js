const {GoogleGenerativeAI} = require('@google/generative-ai'); 
require('dotenv').config(); 

// Initialize the AI 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 

const modelAI = genAI.getGenerativeModel({model: 'gemini-1.5-flash'}); 

async function analyzeClothingImage(imageBuffer) { 
    try { 
        const prompt = `Analyze this image I am providing you. I want you to analyze it and provide the details in a JSON format with these fields: 
            { 
                "color": string, 
                "brand": (if recognizable) (string), 
                "style": string,  
                "pattern": string 
            }

            Do not include additional text, explanations, or markdown formatting. Only the return JSON object.
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

        const response = await modelAI.generateContent(request); 

        const responseText = response.text; 

        const jsonStart = responseText.indexOf('{'); 
        const jsonEnd = responseText.lastIndexOF('}') + 1; 
        const jsonString = responseText.slice(jsonStart, jsonEnd); 

        return JSON.parse(jsonString); 
    }
    catch (error) { 
        console.error('Image analysis error', error); 
        throw error; 
    }
}

async function findNearbyStoresAI(latitude, longitude, brandStores) { 
    try { 
        const prompt = `Based on the user's location (${latitude, longitude}), I want you to generate a list of potential clothing brand stores from these known brandsL ${brandStores.join(', ')}. 
            Return a JSON array with these fields for each store: 
                - name (string), 
                - address (string), 
                - latitude (number), 
                - longitude (number), 
                - brand (string)
        
            Include only realistic store locations that would actually exist in that area, based on the user's location.
        `

        const request = { 
            contents: [{
                parts: [{text: prompt}]
            }]
        }; 

        const response = await modelAI.generateContent(request); 
        const stores = JSON.parse(response.response.candidates[0].content.parts[0].text); 

        return stores.map(store => ({ 
            ...store, 
            distanceMeters: haversine(latitude, longitude, store.latitude, store.longitude), 
            distance: (haversine(latitude, longitude, store.latitude, store.longitude)*0.000621371).toFixed(1) + ' miles'
        })); 
    }
    catch (error) { 
        console.error('Store finding error: ', error); 
        throw error; 
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


module.exports = {analyzeClothingImage, findNearbyStoresAI}; 