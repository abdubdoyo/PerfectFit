const express = require('express'); 
const mongoose = require('mongoose'); 
const cors = require('cors'); 
require('dotenv').config(); 


const PORT = process.env.PORT; 
const app = express(); 
const mongoURI = process.env.MONGODB_URL; 

// Middlewares
app.use(cors()); 
app.use(express.json()); 

const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

app.get('/', (req, res) => { 
    res.send("Backend server is running and MongoDB"); 
})

mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => { 
        console.log('MongoDB Atlas connection error: ', err.message)
    }); 

app.listen(PORT, () => {
    console.log("Server is running on port 3000"); 
})