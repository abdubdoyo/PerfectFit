const {GoogleGenerativeAI} = require('@google/generative-ai'); 
require('dotenv').config(); 

// Initialize the AI 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 

const modelAI = genAI.getGenerativeModel({model: 'gemini-1.5-flash'}); 

async function analyzeClothingImage(imageBuffer) { 
    try { 
        const prompt = `Analyzs ONLY THE TOP/UPPER BODY clothing based on the image I am providing you. Ignore all lower body attire. Provide details in this exact JSON format: 
            { 
                "color": string, 
                "brand": (if recognizable) string, 
                "style": string, 
                "pattern": string, 
                "type": "shirt/blouse/t-shirt/hoodie/sweater/etc"
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
        const prompt = `Based on the user's location (${latitude, longitude}), I want you to generate a list of potential clothing brand stores from these known brandsL ${brandStores.join(', ')}. 
            Return a JSON array with these fields for each store: 
            [{
                "name": string, 
                "address": string, 
                "latitude": number, 
                "longitude": number, 
                "brand": string, 
            }]
            Include only realistic store locations that would actually exist in that area, based on the user's location.
            Return ONLY the JSON array with no additional text. 
            Don't include any markdown formatting (\`\`\`json)
        `; 

        const result = await modelAI.generateContent({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        }); 

        const response = await result.response; 
        const responseText = await response.text(); 

        let cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim()

        const jsonStart = cleanedResponse.indexOf('['); 
        const jsonEnd = cleanedResponse.indexOf(']') + 1; 

        if (jsonStart === -1 || jsonEnd === 0) { 
            throw new Error('No valid JSON array found in response'); 
        }

        const jsonString = cleanedResponse.slice(jsonStart, jsonEnd); 
        const stores = JSON.parse(jsonString); 

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