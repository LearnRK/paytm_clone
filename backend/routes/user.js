const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const router = express.Router();
const { User, Account } = require("../db");
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
    console.log("starting zod");
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
        return res.json({
            msg:"username not awailable, try a different one."
        })
    }    
    console.log("cleared username check");
    
    //create user
    const user = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    });
     
    // create hashed password and add to user
    var hashedPassword = await user.createHash(req.body.password);
    user.password_Hash = hashedPassword;

    // Save user object to database
    await user.save();
    
    // create account of user
    await Account.create({
        userId: user._id,
        balance: parseInt(1+ Math.random()*10000)

    })

    //  send response
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

    const user = await User.findOne({ username });
    if(user) {
        if( await user.validatePassword(password)) {
            const userId = jwt.sign({
                username
            }, JWT_SECRET);
            return res.status(200).json({
                message: "Signed in successfully",
                userId
            })
        }
    } else {
        return res.status(200).json({
            msg:" usename or password is incorrect."
        })
    }
})

//  get users
router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }, {
            username: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
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