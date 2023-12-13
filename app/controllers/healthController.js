const asyncHandler = require('express-async-handler')

const health = asyncHandler(async (req, res) =>{
    res.status(200).json({message: "server started/running"});
});

module.exports = health;