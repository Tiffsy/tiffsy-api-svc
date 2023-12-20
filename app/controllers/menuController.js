const asyncHandler = require('express-async-handler')
const {dynamoClient} = require('../database/dbConfig')

const data = [
    {
        title: "Mix Veg & Dal Makhani",
        price: 250,
        description: "Creamy black ",
        rating: 4,
        type: "breakfast"
    },
    {
        title: "Mix Veg & Dal Makhani",
        price: 250,
        description: "Creamy black ",
        rating: 4,
        type: "lunch"
    },
    {
        title: "Mix Veg & Dal Makhani",
        price: 250,
        description: "Creamy black ",
        rating: 4,
        type: "Dinner"
    }
]

const getTodaymenu = asyncHandler(async (req, res) => {

    const {dt} = req.body;
    
    try{
        res.status(200).json(data);
    }
    catch(err){
        res.status(500);
        throw new Error(err)
    }
    

})

const addMenu = asyncHandler(async (req, res) =>{

});

module.exports = {getTodaymenu, addMenu}