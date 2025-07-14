const { GoogleGenerativeAI } = require('@google/generative-ai'); 
require('dotenv').config(); 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 


async function matchImageToStore(imageBase64, storeName) { 
    const model = genAI.getGenerativeModel({model: 'gemini-pro-vision'}); 

    const prompt = `Analyze this clothing item image and determine:
    1. If ${storeName} sells similar items (consider style, color, pattern)
    2. If they likely have this exact item
    3. Confidence level (0-1) based on visual similarity
  
    Respond with JSON format: {
      "match": boolean,
      "exactMatch": boolean,
      "confidence": number (0-1),
      "reason": string,
      "styleDescription": string,
      "suggestedAlternatives": string
    }`;

    const imageParts = [
        {
            inlineData: { 
                data: imageBase64, 
                mimeType: 'image/jpeg'
            }
        }
    ]; 

    try { 
        const result = await model.generateContent([prompt, ...imageParts]); 
        const text = result.response.text(); 

        const cleanedText = text.replace(/```json|```/g,"").trim(); 
        return JSON.parse(cleanedText); 
    }
    catch (error) { 
        console.error('Error in image matching: ', error); 
        return { 
            match: false, 
            exactMatch: false, 
            confidence: 0, 
            reason: 'Error processing image', 
            styleDescription: '', 
            suggestedAlternatives: '' 
        }; 
    }
}

module.exports = matchImageToStore; 