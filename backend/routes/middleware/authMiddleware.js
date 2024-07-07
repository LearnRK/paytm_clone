const { User } = require("../../db")
const jwt = require("jsonwebtoken");
const {JWT_SECRET} = require("../../config");

async function authMiddleware (req, res, next) {
    const token = req.headers.authorization.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = (await User.findOne({ username : decoded.username}))._id;
        next();
    } catch (err) {
        return res.status(403).json({});
    }
};

module.exports = {
    authMiddleware
}