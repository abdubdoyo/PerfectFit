const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkStoreInventory(storeName, size){
    const model = genAI.getGenerativeModel({model: 'gemini-1.5-pro'});

    const prompt = `Does the store "${storeName}" (a clothing store in Toronto) sell t-shirts in size ${size}? If yes, provide the website URL if known. Respond in JSON Like this: {"hasSize": true, "url": "https: //example.com"}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    try{
        const json = JSON.parse(text);
        return json;
    }catch(e){
        if(e.response?.status === 429){
            console.warn("Rate limit hit. Skipping store:", storeName);
            return {hasSize: false, url: null};
        }
        console.error("Could not parse GEMINI response:", e);
        return{
            hasSize: false,
            url: null
        };
    }

};

module.exports = checkStoreInventory;