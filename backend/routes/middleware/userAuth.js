const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../../config");

function authMiddleware (req, res, next) {
    const token = req.headers.authorization;
    const words = token.split(" ");
    const jwtToken = words[1];

    try {
        const decodedValue = jwt.verify(jwtToken, JWT_SECRET);
        if(decodedValue.username) {
            req.username = username;
            next();
        } else {
            res.status(403).json({
                message: "you are not authenticated"
            })
        }
    } catch (err) {
        res.status(411).json({
            message: "incorrect inputs"
        })
    }
}

module.exports = {
    authMiddleware
}