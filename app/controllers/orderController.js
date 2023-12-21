const asyncHandler = require("express-async-handler")
const {dynamoClient} = require("../database/dbConfig");
const { v4: uuidv4 } = require('uuid');


const data = [
    {
        count: 1,
        dish: "Mix Veg & Dal Makhani",
        mealType : "Lunch",
        subscriptionType: "Monthly",
        deliveryDate: "2020-07-30T14:00:00.000-04",
        amount: 100
    },
    {
        count: 2,
        dish: "Mix Veg & Dal Makhani",
        mealType : "Breakfast",
        subscriptionType: "One-day",
        deliveryDate: "2024-07-30T14:00:00.000-04",
        amount: 100
    },
    {
        count: 1,
        dish: "Mix Veg & Dal Makhani",
        mealType : "Dinner",
        subscriptionType: "Weekly",
        deliveryDate: "2020-07-30T14:00:00.000-04",
        amount: 100
    },
    {
        count: 1,
        dish: "Mix Veg & Dal Makhani",
        mealType : "Lunch",
        subscriptionType: "Monthly",
        deliveryDate: "2023-12-31T14:00:00.000-04",
        amount: 100
    },
    {
        count: 1,
        dish: "Mix Veg & Dal Makhani",
        mealType : "Lunch",
        subscriptionType: "Monthly",
        deliveryDate: "2023-07-30T14:00:00.000-04",
        amount: 100
    },
    {
        count: 1,
        dish: "Mix Veg & Dal Makhani",
        mealType : "Lunch",
        subscriptionType: "Monthly",
        deliveryDate: "2023-09-29T14:00:00.000-04",
        amount: 100
    },
    {
        count: 1,
        dish: "Mix Veg & Dal Makhani",
        mealType : "Lunch",
        subscriptionType: "Monthly",
        deliveryDate: "2023-07-30T14:00:00.000-04",
        amount: 100
    },

]

const getOrderDetails = asyncHandler(async (req, res) => {

    const {cst_id} = req.body;
    if (!cst_id) {
        res.status(401);
        throw new Error("Unauthorised, customer ID missing");
    }
    else{
        console.log("Customer ID", cst_id);
        //params
        try{

        }
        catch(err){
            res.status(500)
            throw new Error(err);
        }
    }
});

const addOrder = (async (req, res) => {
    const {cst_id, ordr_dtls} = req.body
    if(!cst_id || !ordr_dtls){
        res.status(401);
        throw new Error("Unauthorised, fields are missing");
    }
    else{
        const data = {cst_id: cst_id, ordr_dtls: ordr_dtls}
        const params = {
            TableName: process.env.CUSTOMER_ORDER_DETAILS,
            Item: data // order details array 
        };
        try{
            dynamoClient.put(params, (err, data) => {
                if (err) {
                    console.error('Error putting item:', err);
                    res.status(500);
                    throw new Error(err)
                } else {
                    res.status(200).json({ result: 'Item inserted successfully:', data });
                }
            });
        }
        catch(err){
            res.status(500);
            throw new Error(err)
        }
    }
});

const getOrdersByTime = asyncHandler(async (req, res) => {
    const {tm_stmp} = req.body;
    if (!tm_stmp) {
        res.status(401);
        throw new Error("Unauthorised, time stamp missing");
    }
    else{
        //params
        try{

        }
        catch(err){
            res.status(500)
            throw new Error(err);
        }
    }
});

const getOrderByDate = asyncHandler(async (req, res) =>{
    const {dt} = req.body;
    if(!dt){
        res.status(401);
        throw new Error("Unauthorised, date missing");
    }
    else{
        //param
        try{

        }
        catch{

        }
    }

});

const getOrderHistory = asyncHandler(async (req, res) => {

    try{
        res.status(200).json(data);
    }
    catch(err){
        res.status(500);
        throw new Error(err)
    }

});
module.exports = {getOrderDetails, getOrdersByTime, addOrder, getOrderByDate, getOrderHistory}