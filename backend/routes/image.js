// We are using tensorflow.js here because it allows us to get a more accurate form of sizing from the user with them being involved in the picture
// We are also using MoveNet because it's a pre trained machine learning model that helps use detects human pose 

const express = require('express'); 
const router = express.Router(); 
const path = require('path'); 
const multer = require('multer'); 
const fs = require('fs'); 

const tf = require('@tensorflow/tfjs-node'); 
const poseDetection = require('@tensorflow-models/pose-detection'); 
const {createCanvas, loadImage} = require('canvas'); 

// Multer config for saving uploads to 'uploads/' folder 
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'), 
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
}); 
const upload = multer({storage}); 

// When the app starts, load the MoveNet pose detection model and store it in the global variable called detector, so that we can use it later to detect human poses in images
let detector; // Declaring a global variable 
async function loadModel() { 
    detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet); 
}
loadModel(); 

function calculateDistance(p1, p2) { 
    return Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2); 
}

async function estimateShoulderWidth(imagePath) { 
    const image = await loadImage(imagePath); // loadImage returns an object that can be drawn on a canvas
    
    // Creates an off-screen canvas with the same dimensions as the image
    // Gets the 2D drawing context and draws the image on the canvas
    const canvas = createCanvas(image.width, image.height); 
    const ctx = canvas.getContext('2d'); 
    ctx.drawImage(image, 0, 0); 

    // This will then turn the image from the canvas into a format so that the detector pre-model can understand it 
    const input = tf.browser.fromPixels(canvas); 
    // Uses the pre-trained model MoveNet detector to estimate the human pose(s) based on the image
    const poses = await detector.estimatePoses(input); 
    // Cleans up memory instantly (for safety reasons)
    input.dispose(); 

    // If no person was detected, it throws an error
    if (!poses[0]) throw new Error('No human pose detected'); 

    // Extracts all the keypoints from the detected person (from their body)
    const keypoints = poses[0].keypoints; 
    const visibleKeypoints = keypoints.filter(kp => kp?.score >= 0.5); 
    if (visibleKeypoints.length === 0) { 
        throw new Error('No clear body parts detected. Please retake photo.')
    }
    // Getting the leftShoulder keypoint 
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder'); 
    // Getting the rightShoulder keypoint 
    const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder'); 
    // Getting the leftHip keypoint
    const leftHip = keypoints.find(kp => kp.name === 'left_hip'); 
    // Getting the rightHip keypoint
    const rightHip = keypoints.find(kp => kp.name === 'right_hip'); 

    // Confidence check 
    const requiredKeypoints = [leftShoulder, rightShoulder, leftHip, rightHip]; 
    if (requiredKeypoints.some(kp => kp.score < 0.5)) { 
        throw new Error('Key body parts are not clearly visible'); 
    }

    // Validation: Too close or too far
    const bodyWidthPx = Math.abs(rightShoulder.x - leftShoulder.x); 
    if (bodyWidthPx < image.width * 0.15) { 
        throw new Error("You are too far away from the camera. Please move closer.")
    }
    if (bodyWidthPx > image.width * 0.8) { 
        throw new Error("You are too close to the camera. Please step back a bit.")
    }

    // Torso reference: Mid-points 
    const midShoulder = { 
        x: (leftShoulder.x + rightShoulder.x) / 2, 
        y: (leftShoulder.y + rightShoulder.y) / 2, 
    }; 
    const midHip = { 
        x: (leftHip.x + rightHip.x) / 2, 
        y: (leftHip.y + rightHip.y) / 2, 
    }; 

    const shoulderWidthPx = calculateDistance(leftShoulder, rightShoulder); 
    const torsoLengthPx = calculateDistance(midShoulder, midHip); 

    return {shoulderWidthPx, torsoLengthPx}
}

function estimateCmFromTorsoRatio(shoulderWidthPx, torsoLengthPx) { 
    const AVERAGE_SHOULDER_TO_TORSO_RATIO = 1.1; 
    const AVERAGE_TORSO_CM = 42 / AVERAGE_SHOULDER_TO_TORSO_RATIO; 
    const torsoScale = AVERAGE_TORSO_CM / torsoLengthPx; 
    return shoulderWidthPx * torsoScale; 
}

function mapToSize(widthCm) { 
    if (widthCm >= 54) return 'XL'; 
    if (widthCm >= 50) return 'L'; 
    if (widthCm >= 46) return 'M'; 
    return 'S'; 
}


router.post('/api/estimate-shirt-size', upload.single('photo'), async (req, res) => { 
    try { 
        // We are getting the user's file path now 
        const imagePath = path.join(__dirname, '../', req.file.path); 
        // We are getting the shoulder width of the user in pixels
        const {shoulderWidthPx, torsoLengthPx} = await estimateShoulderWidth(imagePath); 

        // We need to load image as an object again cause calculation is needed for converting pixels to cm 
        const image = await loadImage(imagePath); 
        const widthCm = estimateCmFromTorsoRatio(shoulderWidthPx, torsoLengthPx); 
        const size = mapToSize(widthCm); 
        const userSize = req.body.userSize; 

        // Compare the size with the size coming from the user 
        let sizeMatch = null; 
        if (userSize) { 
            sizeMatch = (userSize === size); 
            if (!sizeMatch) { 
                console.warn(`Discrepancy: User selected ${userSize}, model predicted ${size}`); 
            }
        }

        fs.unlinkSync(imagePath);  // Clean up loaded image 

        res.json({
            size, 
            shoulderWidthCm: widthCm.toFixed(2), 
            userSize, 
            sizeMatch, // True or False 
            message: `Estimated shirt size in ${size}` + (userSize ? ` (You selected: ${userSize})` : ''), 
        }); 
    }
    catch (error) { 
        console.log(error); 
        const errorMessage = error.message || 'Pose estimation failed'; 

        if (
            errorMessage.includes('clearly visible') || errorMessage.includes('too far') || errorMessage.includes('too close')
        ) { 
            return res.status(400).json({error: errorMessage}); 
        }

        res.status(500).json({error: 'Internal server error'}); 
    }
})

module.exports = router; 