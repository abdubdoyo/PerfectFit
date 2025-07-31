const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 

// Only based on the brandStores that are being given in findStoresWithAI
async function generateStoreUrl(stores, clothingDetails, country) { 
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro'
    }); 

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
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();
        
        console.log("Raw AI Response:", responseText);  // Debug logging

        // Extract JSON from response
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}') + 1;
        const jsonString = responseText.slice(jsonStart, jsonEnd);

        // Clean the JSON string
        let cleanJson = jsonString
            .replace(/'/g, '"')  // Replace single quotes
            .replace(/(\w+)(\s*:\s*)/g, '"$1":')  // Ensure proper quotes around keys
            .replace(/,\s*}/g, '}')  // Remove trailing commas
            .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays

        console.log("Cleaned JSON:", cleanJson);  // Debug logging

        cleanJson = cleanJson
            .replace(/""https"":/g, '"https:')  // Fix the malformed URLs
            .replace(/""http"":/g, '"http:')    // Fix http URLs if they exist
            .replace(/"Unsure"/g, 'null');      // Handle "Unsure" values

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