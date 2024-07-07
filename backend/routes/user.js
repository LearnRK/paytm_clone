const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const router = express.Router();
const { User } = require("../db");
const { authMiddleware } = require("./middleware/authMiddleware");

//create a zod schema
const signupSchema = zod.object({
    username: zod.string(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string()
})

// signup route
router.post("/signup",async (req, res) => {
    const body = req.body;
    // verify inputs with zod
    const {success} = signupSchema.safeParse(body);
    if(!success) {
        res.status(403).json({
            msg:"invalid inputs, exit from zod."
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

// signin route
router.post("/signin", async(req,res) => {
    const username = req.headers.username;
    const password = req.headers.password;

    if(!username || !password){
        res.status(403).json({
            message: "provide username and password"
        });
        return;
    }
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

//  get users
router.get("/bulk",async (req, res) => {
    const filter = req.query.filter;
    if(!filter) {
        console.log((await User.find()).map( (tuple) => { return tuple.username}));
        const allUsers = (await User.find()).map( (tuple) => { return tuple.firstName});
        res.json({  allUsers });
        return;
    }
    const user = await User.findOne({
        username: filter
    })
    if(user){
        res.json({
            message: "Found user successfully.",
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        })
    } else {
        res.json({
            message : "user not found."
        })
    }

})

// validate update values
const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

//update user information
router.put("/", authMiddleware ,async (req, res) => {
    const {success} = updateBody.safeParse(req.body);
    if(!success){
        res.status(411).json({
            message: "error while updating information."
        })
    }
   
        const response = await User.updateOne({ _id:req.userId},{
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password
    });
    console.log(response);
    res.json({
        message: "Updated successfully"
    })
})

module.exports = router;