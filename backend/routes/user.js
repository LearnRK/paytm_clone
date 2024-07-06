const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const router = express.Router();
const { User } = require("../db");

//create a zod schema
const signupSchema = zod.object({
    username: zod.string(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string(),
    email: zod.string().email(),
    phoneNumber: zod.number()
})

// signup route
router.post("/signup",async (req, res) => {
    const body = req.body;
    // verify inputs with zod
    const {success} = signupSchema.safeParse(body);
    if(!success) {
        res.status(403).json({
            msg:"invalid inputs."
        })
    }
    console.log("cleared zod");
    // check if user already exists
    const userExist = await User.findOne({
        username : body.username
    });
    if(userExist){
        console.log("username already present in db.")
        res.json({
            msg:"username not awailable, try a different one."
        })
    }    
    console.log("cleared username check");
    //create user 
    const user = await User.create(body)
    const token = jwt.sign({
        userId:user._id
    }, JWT_SECRET);
    res.status(200).json({
        message: " User created successfully.",
        token
    })
})

router.post("/signin", async(req,res) => {
    const username = req.headers.username;
    const password = req.headers.password;

    await User.find({
        username,
        password
    })
    .then((value) =>{
        if(value){
            const userId = jwt.sign({
                username
            }, JWT_SECRET);
            res.status(200).json({
                message: "Signed in successfully",
                userId
            })
        } else {
            res.status(200).json({
                msg:" usename or password is incorrect."
            })
        }
    })
    .catch((err) => {
        console.log("caught, something went wrong.")
        res.status(400).json({
            msg:"something went wrong."
        })
    })
})

module.exports = router;