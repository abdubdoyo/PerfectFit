const { GoogleGenAI  } = require('@google/genai');
require('dotenv').config();

const genAI = new GoogleGenAI ({apiKey: process.env.GEMINI_API_KEY}); 

// Only based on the brandStores that are being given in findStoresWithAI
async function generateStoreUrl(stores, clothingDetails, country) { 

    const prompt = `Generate an e-commerce search URLs for these stores in ${country} matching: ${clothingDetails.color} ${clothingDetails.type}. 
    
    Stores: 
    ${stores.map(store => `"${store.name}"`).join('\n')}

    Rules:
    1. Return ONLY valid JSON format
    2. Use double quotes for all property names and strings
    3. Include proper commas between properties
    4. Ensure the JSON is properly closed with }
    5. Example format:
    {
        "H&M": "https://www2.hm.com/en_ca/search?q=white+t-shirt",
        "Zara": "https://www.zara.com/ca/en/search?searchTerm=white+t-shirt"
    }`;

    try {
        const result = await genAI.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt
        });
        const responseText = result.text;
        
        console.log("Raw AI Response:", responseText);  // Debug logging

        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
        if (!jsonMatch) {
            throw new Error('No valid JSON object found in AI response');
        }
        const jsonString = jsonMatch[0];

        // Clean the JSON string (minimal cleaning since AI is generating better JSON now)
        let cleanJson = jsonString
            .replace(/'/g, '"')  // Replace single quotes if any
            .replace(/,\s*}/g, '}')  // Remove trailing commas
            .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays

        console.log("Final Cleaned JSON:", cleanJson);  // Verify the fix
        const urls = JSON.parse(cleanJson);

        return stores.map(store => ({
            ...store,
            searchUrl: urls[store.name] || null
        }));
    } catch (error) {
        console.error('URL generation failed:', error);
        return stores.map(store => ({
            ...store, 
            searchUrl: null
        }));
    }
}

module.exports = { generateStoreUrl }; 