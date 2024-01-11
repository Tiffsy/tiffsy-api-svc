const asyncHandler = require('express-async-handler')
const jwt = require("jsonwebtoken")

const health = asyncHandler( async (req, res) => {
    res.status(200).json({message: "server started/running"});
});

const login = asyncHandler( async (req, res) => {
    const {email} = req.body;
    if(!email){
        res.status(400);
        throw new Error("unauthorised");
    }
    const token = jwt.sign({
        user:{
            username: email
        }
    },process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: "5m"
    });
    res.status(200).json({token});
})

module.exports = {health, login};