// require mongoose
const { kMaxLength } = require("buffer");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// connect to MongoDB
mongoose
.connect("mongodb://localhost:27017/paytm_1")
.then(console.log("Connected to DB successfully."))
.catch((e) =>{console.log("connection to DB failed.")})

// create schema
const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    firstName:{
        type:String,
        required:true,
        trim: true,
        maxLength: 50
    },
    lastName:{
        type:String,
        required:true,
        trim: true,
        maxLength: 50
    },
    password_Hash:{
        type:String,
        required:true,
    }
})

// Method to generate a hash from plain text
UserSchema.methods.createHash = async function (plainTextPassword) {

    // Hashing user's salt and password with 10 iterations,
    const saltRounds = 10;
  
    // First method to generate a salt and then create hash
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(plainTextPassword, salt);
  
    // Second mehtod - Or we can create salt and hash in a single method also
    // return await bcrypt.hash(plainTextPassword, saltRounds);
};
  
  // Validating the candidate password with stored hash and hash function
UserSchema.methods.validatePassword = async function (candidatePassword) {
return await bcrypt.compare(candidatePassword, this.password_Hash);
};

const AccountSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    balance : {
        type: Number,
        required: true
    }
})

// create a model of schema
const User = mongoose.model('User',UserSchema);

// export schema
module.exports = {
    User,
}