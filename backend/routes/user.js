const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const router = express.Router();
const { User } = require("../db");

// signup route
router.post("/signup",async (req, res) => {
    const username = req.body.username;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const password = req.body.password;
    const email = req.body.email;
    const phone_number = req.body.phone_number;

    const userExist = await User.findOne({
        username
    });
    if(!userExist){
        await User.create({
            username,
            first_name,
            last_name,
            email,
            password,
            phone_number
        })
        .then((value) => {
            if(value){
                const userId = jwt.sign({
                    username
                }, JWT_SECRET);
                res.status(200).json({
                    userId
                })
                console.log("user created successfully.");
            } else {
                console.log("failed to create user.");
                res.status(400).json({msg:"failed to signup."})
            }
        })
        .catch((err) => {
            console.log("caught! something went wrong.");
            res.status(400).json({msg:"failed to signup."})
        });
    } else {
        console.log("username already present in db.")
        res.json({
            msg:"username not awailable, try a different one."
        })
    }

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