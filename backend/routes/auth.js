const User = require('../models/user'); 
const bcrypt = require('bcrypt'); 
const express = require('express'); 
const jwt = require('jsonwebtoken'); 
const router = express.Router();

// As soon as the user presses the register button, first route 
router.post('/register', async (req, res) => { 
    try { 
        const { email, password } = req.body; 
        // Check if this user already exists
        const existingUser = await User.findOne({email}); 
        if (existingUser) return res.status(400).json({message: "User already exists"}); 

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); 
        
        // Create a new user and save it 
        const newUser = new User({email, password: hashedPassword}); 
        await newUser.save(); 
        res.status(201).json({message: "User registered successfully"}); 
    }
    catch (err) { 
        res.status(500).json({message: "Server error"}); 
    }
}); 

// 2nd Route
router.post('/login', async (req, res) => { 
    try { 
        const {email, password} = req.body; 
        const user = await User.findOne({email}); 
        if (!user) return res.status(400).json({message: "Invalid email or email has not been registered"}); 

        // Compare passwords first
        const isMatch = await bcrypt.compare(password, user.password); 
        if (!isMatch) return res.status(400).json({message: "Invalid password or password is not matched"}); 

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'}); 
        res.status(200).json({token, message: "Log in successfull"}); 
    }
    catch (error) { 
        res.send(500).json({message: "Server error"}); 
    }
});

module.exports = router;