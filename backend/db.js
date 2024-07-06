// require mongoose
const { kMaxLength } = require("buffer");
const mongoose = require("mongoose");

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
    first_name:{
        type:String,
        required:true,
        trim: true,
        maxLength: 50
    },
    last_name:{
        type:String,
        required:true,
        trim: true,
        maxLength: 50
    },
    email:{
        type:String,
        required:false
    },
    phone_number:{
        type:Number,
        required:false
    },
    password:{
        type:String,
        required:true,
        minLength: 6
    },
    ammount:{
        type:String,
    },
})

// create a model of schema
const User = mongoose.model('User',UserSchema);

// export schema
module.exports = {
    User,
}