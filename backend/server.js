const express = require('express'); 
const mongoose = require('mongoose'); 
const cors = require('cors'); 
const authRoutes = require('./routes/auth');
const imageRoutes = require('./routes/image');
require('dotenv').config(); 

const PORT = process.env.PORT; 
const app = express(); 
const mongoURI = process.env.MONGODB_URL; 

// Middlewares
app.use(cors()); 
app.use(express.json()); 

app.use('/api', authRoutes);
app.use('/', imageRoutes)

mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => { 
        console.log('MongoDB Atlas connection error: ', err.message)
    }); 

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`); 
})