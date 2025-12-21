# Attire size predictor
A React Native mobile app that helps users find nearby clothing stores carrying items that match their size.
Users can take a photo of clothing, get AI-powered size analysis, and discover local stores with inventory links.

## 🎥 App Preview
https://github.com/user-attachments/assets/fd092348-9e88-4306-b8c8-3e5d7409788d

# Features
📸 Photo capture and upload
🤖 AI clothing size estimation
🗺️ Nearby store discovery via Google Places API
🔍 Real-time inventory checking with web scraping
📱 Expo-powered cross-platform mobile experience

# Tech Stack
Frontend: React Native, Expo, TypeScript
Backend: Node.js, Express, MongoDB
AI: Google Gemini for image analysis and URL generation
APIs: Google Places, ScraperAPI for web scraping

# Running the Application Locally
### Prerequisites
  Node.js (v16 or higher)
  npm or yarn
  Expo CLI (npm install -g @expo/cli)
  MongoDB Atlas account (for database)
  API Keys for:
  Google Places API
  Google Gemini AI
  ScraperAPI

  Create a .env file and add this code:
  PORT=3000
  MONGODB_URL=your_mongodb_atlas_connection_string
  JWT_SECRET=your_jwt_secret
  GEMINI_API_KEY=your_google_gemini_api_key
  GOOGLE_PLACE_KEY=your_google_places_api_key
  SCRAPER_API_KEY=your_scraperapi_key

```bash
# clone repository:
  $ git clone https://github.com/RohanRamchandani/Attire-Project.git
  $ cd Attire-Project

# Setup backend:
  $ cd backend
  $ npm install  
  $ node server.js

# Setup frontend:
  $ cd frontend/my-app
  $ npm install
  $ npm start
```
