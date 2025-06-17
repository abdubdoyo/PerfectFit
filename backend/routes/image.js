//import necessary modules
const express = require('express');
// Multer handles file uploads from HTTP request 
const multer = require('multer');
const path = require('path');
// Fs is for getting the file system and then deleting the file system after image processing 
const fs = require('fs');
const vision = require('@google-cloud/vision');

const router = express.Router();
//Configure multer for temporary file storage
const upload = multer({dest:'uploads/'});
//Create a Google Cloud Vision API client
const client = new vision.ImageAnnotatorClient();

//Post endpoint to analyze the uploaded image from frontend
router.post('/api/analyze-image', upload.single('photo'), async(req, res) => {
    try {
        // Get full file path of the uploaded image
        const filePath = path.join(__dirname, '../', req.file.path);
        // Send the image to Google Cloud Vision API for object localization
        const [result] = await client.objectLocalization({
            image: {source: {filename: filePath}}
        });
        // Get list of detected objects
        const objects = result.localizedObjectAnnotations;

        //Find the detected tshirt and credit card
        const shirt = objects.find(obj => obj.name.toLowerCase().includes('shirt')  || obj.name === 'Apparel') ;
        const card = objects.find(obj => obj.name.toLowerCase().includes('card'));
        //If shirt or card is not found then return an error response
        if(!shirt) return res.status(400).json({message: "No shirt detected in the image"});
        if(!card) return res.status(400).json({message: "No card detected in the image"});

        // Helper function to calculate the width of the bounding box
        const getWidth = (bbox) => Math.abs(bbox[0].x - bbox[1].x);

        // Get the bounding box width ratios for shirt and card
        const shirtWidthRatio = getWidth(shirt.boundingPoly.normalizedVertices);
        const cardWidthRatio = getWidth(card.boundingPoly.normalizedVertices);

        // Standard credit card width in cm
        const CARD_WIDTH_CM = 8.56; 
        // Calculte how many cm each unit of normalized width equals
        const scaleFactor = CARD_WIDTH_CM / cardWidthRatio;

        // Use the scale factor to convert the shirt's normalized width to into real-wolrd cm
        const shirtWidthCm = shirtWidthRatio * scaleFactor;

        // Map the shirt width in cm to a size
        const size = mapToSize(shirtWidthCm);

        // return the result to the frontend as a JSON response
        res.json({
            size: size,
            widthCm : shirtWidthCm.toFixed(2),
            message: `Shirt size is ${size}`
        });
        
        // Clean up the uploaded file after processing
        fs.unlinkSync(filePath); 
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: "Image processing failed"});
    }
});

function mapToSize(widthCm) {
    if(widthCm >= 58) return 'XL';
    if(widthCm >= 54) return 'L';
    if(widthCm >= 50) return 'M';
    return 'S';
}

module.exports = router;