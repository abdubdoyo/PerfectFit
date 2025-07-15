const { GoogleGenerativeAI } = require('@google/generative-ai');
const matchImageToStore = require('../imageMatcher'); 
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkStoreInventory(storeName, size, imageBase64 = null){
    const model = genAI.getGenerativeModel({model: 'gemini-2.5-pro'});

    // First check if the store carries the size 
    const prompt = `Does the store "${storeName}" (a clothing store) sell t-shirts in size ${size}? If yes, provide the website URL if known. Respond in JSON Like this: {"hasSize": true, "url": "https: //example.com"}`;

    const result = await model.generateContent(prompt);
    let sizeText = result.response.text();
    sizeText = sizeText.replace(/```json|```/g,"").trim(); 
    
    let sizeCheck; 

    try{
        sizeCheck = JSON.parse(sizeText); 
    }catch(e){
        console.error('Could not parse size check response: ', e); 
        sizeCheck = {hasSize: false, url: null}; 
    }

    // If there's an image, check if it matches the store's style
    let imageMatch = {match: true, confidence: 1, reason: 'No image provided'}; 
    if (imageBase64) { 
        imageMatch = await matchImageToStore(imageBase64, storeName); 
    }

    return { 
        ...sizeCheck, 
        imageMatch: imageMatch.match, 
        matchConfidence: imageMatch.confidence, 
        matchReason: imageMatch.reason 
    }; 
};

module.exports = checkStoreInventory;