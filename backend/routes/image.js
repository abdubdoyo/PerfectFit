// Express & Core Modules
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const {GoogleGenerativeAI} = require('@google/generative-ai'); 
const sharp = require('sharp'); 
require('dotenv').config(); 

// Initializing AI Model 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 

// TensorFlow.js & Pose Detection
const tf = require('@tensorflow/tfjs');
const poseDetection = require('@tensorflow-models/pose-detection');
const { createCanvas, loadImage } = require('canvas');

// Multer Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Load MoveNet THUNDER model
let detector;
async function loadModel() {
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
    modelType: poseDetection.movenet.modelType.THUNDER,
  });
}
loadModel();

function calculateDistance(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

// AI Clothing Size Estimation
async function estimateClothingSizeAI(imagePath, userInputSize) { 
  try { 
    const processedImage = await sharp(imagePath).normalize().sharpen().resize(1024, 1024, {fit: 'inside', withoutEnlargement: true}).toBuffer(); 

    const model = genAI.getGenerativeModel({model: 'gemini-1.5-flash'}); 

    const prompt = `Analyze this clothing item image with extreme precision:
      USER PROVIDED SIZE: ${userInputSize || 'Not provided'} (use only as secondary reference)
      1. First check for any visible size tags (S, M, L, XL, number, or brand-specific sizing)
      2. If there's no tag, compare the item to common reference objects in the image (hangers, hands, etc.)
      3. For folded items, estimate based on fold patters and proportions
      4. Consider brand-specific sizing norms if brand is identifiable
      5. When uncertain, bias toward smaller sizes

      return JSON with: 
      { 
        "size": "exact tag text or estimated size (XXS-XS-S-M-L-XL-XXL), 
        "sizeSource": "tag/estimation/brand", 
        "dimensions": { 
          "shoulderWidthCm": number, 
          "chestWidthCm": number, 
          "lengthCm": number, 
          "confidence": 0-1
        }, 
        "reasoning": "brief explanation of determination"
        "matchesUserInput": boolean
      }
    `; 

    const imageParts = [{
      inlineData: { 
        data: processedImage.toString('base64'), 
        mimeType: 'image/jpeg'
      }
    }]; 

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: processedImage.toString('base64')
              }
            }
          ]
        }
      ]
    });

    const responseText = await result.response.text(); 
    const cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim(); 
    const response = JSON.parse(cleanedResponse); 
    
    return { 
      size: response.size, 
      dimensions: response.dimensions
    }; 
  }
  catch (error) { 
    console.error('AI size estimation failed: ', error); 
    return null; 
  }
}

async function containsHuman(imagePath) { 
  try { 
    const image = await loadImage(imagePath); 
    const canvas = createCanvas(512, 512); 
    const ctx = canvas.getContext('2d'); 

    ctx.drawImage(image, 0, 0, 512, 512); 
    const input = tf.browser.fromPixels(canvas); 
    const poses = await detector.estimatePoses(input); 
    input.dispose(); 
    return poses.length > 0; 
  }
  catch { 
    return false; 
  }
}



async function estimateShoulderWidth(imagePath) {
  const image = await loadImage(imagePath);
  const TARGET_SIZE = 512;
  const canvas = createCanvas(TARGET_SIZE, TARGET_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, TARGET_SIZE, TARGET_SIZE);

  const input = tf.browser.fromPixels(canvas);
  const poses = await detector.estimatePoses(input);
  input.dispose();

  if (!poses.length || poses.length > 1) throw new Error('Ensure only one person is visible in the frame.');
  const keypoints = poses[0].keypoints;
  const get = (name) => keypoints.find(kp => kp.name === name);
  const scoreOK = (kp) => kp?.score >= 0.5;

  const leftShoulder = get('left_shoulder');
  const rightShoulder = get('right_shoulder');
  const leftHip = get('left_hip');
  const rightHip = get('right_hip');
  const leftElbow = get('left_elbow');
  const rightElbow = get('right_elbow');
  const leftWrist = get('left_wrist');
  const rightWrist = get('right_wrist');
  const nose = get('nose');

  const requiredKeypoints = [leftShoulder, rightShoulder, leftHip, rightHip];
  if (requiredKeypoints.some(kp => !scoreOK(kp))) {
    throw new Error('Key body parts not clearly visible.');
  }

  const bodyWidthPx = Math.abs(rightShoulder.x - leftShoulder.x);
  if (bodyWidthPx < TARGET_SIZE * 0.15) throw new Error('Move closer to the camera.');
  if (bodyWidthPx > TARGET_SIZE * 0.8) throw new Error('Move slightly away from the camera.');

  // Posture & Symmetry Validation
  const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
  if (shoulderTilt > TARGET_SIZE * 0.1) throw new Error('Stand upright with level shoulders.');

  const armsRaised = scoreOK(leftElbow) && leftElbow.y < leftShoulder.y && scoreOK(rightElbow) && rightElbow.y < rightShoulder.y;
  if (armsRaised) throw new Error('Lower your arms and relax your posture.');

  if (scoreOK(leftWrist) && scoreOK(rightWrist) && scoreOK(leftHip) && scoreOK(rightHip)) {
    const midHipX = (leftHip.x + rightHip.x) / 2;
    const lOffset = Math.abs(leftWrist.x - midHipX);
    const rOffset = Math.abs(rightWrist.x - midHipX);
    if (Math.abs(lOffset - rOffset) > TARGET_SIZE * 0.2) {
      throw new Error('Face directly forward. Do not turn sideways.');
    }
  }

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

  return { shoulderWidthPx, torsoLengthPx };
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

function combineEstimations(aiEstimation, poseEstimation) { 
  const sizeMap = { XXS: 0, XS: 1, S: 2, M: 3, L: 4, XL: 5}; 
  const reverseSizeMap = ['XXS', 'XS', 'S', 'M', 'L', 'XL']; 

  const aiSizeValue = sizeMap[aiEstimation.size] || 3; 
  const poseSizeValue = sizeMap[poseEstimation.size] || 3; 

  const combinedValue = Math.round((aiSizeValue * 0.6) + (poseSizeValue * 0.4)); 
  const combinedSize = reverseSizeMap[Math.min(Math.max(combinedValue, 0), 5)]; 

  return { 
    size: combinedSize, 
    method: 'combined', 
    confidence: (aiEstimation.dimensions.confidence * 0.6 + poseEstimation.confidence * 0.4), 
    components: { 
      ai: aiEstimation,
      pose: poseEstimation
    }
  }; 
}

function getResultMessage(aiEstimation, poseEstimation, combinedEstimation) { 
  if (combinedEstimation) { 
    return `Combined estimation: ${combinedEstimation.size}`; 
  }

  if (aiEstimation) { 
    return `Detected size of ${aiEstimation.size}`; 
  }

  if (poseEstimation) { 
    return `Estimated size from body measurements: ${poseEstimation.size}`; 
  }

  return 'Could not determine size from the photo'; 
}


router.post('/api/estimate-shirt-size', upload.single('photo'), async (req, res) => {
  try {
    const imagePath = path.join(__dirname, '../', req.file.path);
    const userSize = req.body.userSize; 

    const [aiEstimation, hasHuman] = await Promise.all([
      estimateClothingSizeAI(imagePath, userSize), 
      containsHuman(imagePath)
    ]); 

    let poseEstimation = null; 
    let combinedEstimation = null; 

    // If there's a human in the image, always try pose detection 
    if (hasHuman) { 
      try { 
        const poseData = await estimateShoulderWidth(imagePath); 
        const widthCm = await estimateCmFromTorsoRatio(poseData.shoulderWidthPx, poseData.torsoLengthPx); 

        poseEstimation = { 
          method: 'pose', 
          size: mapToSize(widthCm), 
          confidence: 0.8, 
          dimensions: {shoulderWidthCm: widthCm.toFixed(2)}
        }; 

        // If we have both AI and pose detection, combine them 
        if (aiEstimation) { 
          combinedEstimation = combineEstimation(aiEstimation, poseEstimation); 
        }
      }
      catch (poseError) { 
        console.log('Pose estimation failed:', poseError.message); 
      }
    }

    const finalSize = combinedEstimation?.size || aiEstimation?.size || (poseEstimation?.size || 'Unknown'); 

    const result = { 
      aiEstimation, 
      poseEstimation, 
      combinedEstimation, 
      finalSize, 
      message: getResultMessage(aiEstimation, poseEstimation, combinedEstimation)
    }; 

    if (userSize) { 
      result.userComparison = { 
        userSize, 
        matchesEstimation: userSize === finalSize
      }; 
    }

    setTimeout(() => fs.unlinkSync(imagePath), 500); 
    res.json(result); 
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message, 
    })
  }
});

module.exports = router;