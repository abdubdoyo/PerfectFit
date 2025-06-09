// We are creating this so that we have a database storage of how the user will store their data as soon as they press the register button 
const mongoose = require('mongoose'); 

const userSchema = new mongoose.Schema({ 
    email: {type: String, required: true, unique: true}, 
    password: {type: String, required: true}, 
}); 

module.exports = mongoose.model('User', userSchema); 