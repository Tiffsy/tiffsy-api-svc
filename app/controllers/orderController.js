const asyncHandler = require("express-async-handler")
const { dynamoClient } = require("../database/dbConfig");
const { v4: uuidv4 } = require('uuid');


const data = [
    {
        count: 1,
        dish: "Mix Veg & Dal Makhani",
        mealType: "Lunch",
        subscriptionType: "Monthly",
        deliveryDate: "2020-07-30T14:00:00.000-04",
        amount: 100
    },
    {
        count: 2,
        dish: "Mix Veg & Dal Makhani",
        mealType: "Breakfast",
        subscriptionType: "One-day",
        deliveryDate: "2024-07-30T14:00:00.000-04",
        amount: 100
    },
    {
        count: 1,
        dish: "Mix Veg & Dal Makhani",
        mealType: "Dinner",
        subscriptionType: "Weekly",
        deliveryDate: "2020-07-30T14:00:00.000-04",
        amount: 100
    },
    {
        count: 1,
        dish: "Mix Veg & Dal Makhani",
        mealType: "Lunch",
        subscriptionType: "Monthly",
        deliveryDate: "2023-12-31T14:00:00.000-04",
        amount: 100
    },
    {
        count: 1,
        dish: "Mix Veg & Dal Makhani",
        mealType: "Lunch",
        subscriptionType: "Monthly",
        deliveryDate: "2023-07-30T14:00:00.000-04",
        amount: 100
    },
    {
        count: 1,
        dish: "Mix Veg & Dal Makhani",
        mealType: "Lunch",
        subscriptionType: "Monthly",
        deliveryDate: "2023-09-29T14:00:00.000-04",
        amount: 100
    },
    {
        count: 1,
        dish: "Mix Veg & Dal Makhani",
        mealType: "Lunch",
        subscriptionType: "Monthly",
        deliveryDate: "2023-07-30T14:00:00.000-04",
        amount: 100
    },

]

const getOrderDetails = asyncHandler(async (req, res) => {

   
});

const addOrder = asyncHandler(async (req, res) => {
    const { cst_id, ordr_id, timestamp, ordr_dsc, ordr_ttl, ordr_status, ordr_typ, address, price } = req.body

    if (!cst_id || !ordr_id || !price || !address || !ordr_typ || !ordr_ttl) {
        res.status(401);
        throw new Error("Unauthorised, fields are missing");
    }
    else {
        const data = {
            cst_id: cst_id,
            ordr_id: ordr_id,
            timestamp: timestamp,
            ordr_dsc: ordr_dsc,
            ordr_ttl: ordr_dsc,
            ordr_status: ordr_status,
            ordr_typ: ordr_dsc,
            address: address,
            price: price,
        }
        const params = {
            TableName: process.env.CUSTOMER_ORDERS,
            Item: data // order details array 
        };
        try {
            const x = dynamoClient.put(params, (err, data) => {
                console.log(data);
                if (err) {
                    console.error('Error putting item:', err);
                    res.status(500);
                    throw new Error(err);
                } else {
                    res.status(200).json({ result: 'SUCCESS' });
                }
            });
        }
        catch (err) {
            res.status(500);
            throw new Error(err)
        }
    }
});

const getOrdersByTime = asyncHandler(async (req, res) => {
    const { tm_stmp } = req.body;
    if (!tm_stmp) {
        res.status(401);
        throw new Error("Unauthorised, time stamp missing");
    }
    else {
        //params
        try {

        }
        catch (err) {
            res.status(500)
            throw new Error(err);
        }
    }
});

const getOrderByDate = asyncHandler(async (req, res) => {
    const { dt } = req.body;
    if (!dt) {
        res.status(401);
        throw new Error("Unauthorised, date missing");
    }
    else {
        //param
        try {

        }
        catch {

        }
    }

});

const getOrderHistory = asyncHandler(async (req, res) => {
    const { cst_id } = req.body;
    if (!cst_id) {
        res.status(401);
        throw new Error("Unauthorised, customer ID missing");
    }
    else {
        console.log("Customer ID", cst_id);
        const params = {
            TableName: process.env.CUSTOMER_ORDERS,
            KeyConditionExpression: 'cst_id = :pk',// AND ordr_id = :sk', // remove addr_id condition if want to query based on cst_id only
            ExpressionAttributeValues: {
                ':pk': cst_id,
                //':sk': '1', // remove this also if want to query based on cst_id only
            }
        };
        try {
            const response = await dynamoClient.query(params, (err, data) => {
                if (err) {
                    console.error('Error Fetch items:', err);
                    res.status(500);
                    throw new Error(err);
                } else {
                    res.status(200).json({ result: 'SUCCESS' , data: data["Items"]});
                }
            });  
        }
        catch (err) {
            res.status(500)
            throw new Error(err);
        }
    }
});

const deleteOrderById = asyncHandler(async (req, res) => {
    const { cst_id, ordr_id } = req.body;
    if (!cst_id) {
        res.status(401);
        throw new Error("Unauthoried, customer ID missing");
    }
    else if (!ordr_id) {
        res.status(401);
        throw new Error("Unauthoried, Order ID missing");
    }
    else {
        const params = {
            TableName: process.env.CUSTOMER_ORDERS,
            Key: {
                cst_id: cst_id,
                ordr_id: ordr_id
            }
        };
        const response = dynamoClient.delete(params, (err, data) => {
            if (err) {
                console.error('Error putting item:', err);
                res.status(500);
                throw new Error(err);
            } else {
                res.status(200).json({ result: 'SUCCESS' });
            }
        });
    }
});

const cancelOrderById = asyncHandler(async (req, res) => {
    const { cst_id, ordr_id } = req.body;
    if (!cst_id) {
        res.status(401);
        throw new Error("Unauthoried, customer ID missing");
    }
    else if (!ordr_id) {
        res.status(401);
        throw new Error("Unauthoried, Order ID missing");
    }
    else {
        const params = {
            TableName: process.env.CUSTOMER_ORDERS,
            Key: {
                cst_id: cst_id,
                ordr_id: ordr_id,
            },
            UpdateExpression: 'SET ordr_status = :value1, price = :value2',
            ExpressionAttributeValues: {
                ':value1': 'cancelled',
                ':value2': 400,
            },
            ReturnValues: 'ALL_NEW'
        };

        const response = await dynamoClient.update(params, (err, data) => {
            if (err) {
                console.error('Error putting item:', err);
                res.status(500);
                throw new Error(err);
            } else {
                res.status(200).json({ result: 'SUCCESS' , data});
            }
        });
    }
})

const cancelDate = [
    "2024-01-29T14:00:00.000-04",
    "2023-12-29T14:00:00.000-04",
    "2024-01-15T14:00:00.000-04",
    "2024-01-20T14:00:00.000-04",
]
const OrderDates = [
    "2024-01-03T14:00:00.000-04",
    "2024-01-29T14:00:00.000-04",
    "2023-12-29T14:00:00.000-04",
    "2024-01-15T14:00:00.000-04",
    "2024-01-20T14:00:00.000-04",
    "2024-01-28T14:00:00.000-04",
    "2023-12-27T14:00:00.000-04",
    "2024-01-15T14:00:00.000-04",
    "2024-01-21T14:00:00.000-04",
    "2024-01-01T14:00:00.000-04",
    "2024-01-02T14:00:00.000-04",
    "2024-01-03T14:00:00.000-04",
    "2024-01-04T14:00:00.000-04",
    "2024-01-05T14:00:00.000-04",
    "2024-01-06T14:00:00.000-04",
]
const cancelOrderByDate = asyncHandler(async (req, res) => {
    res.status(200).json();
});

const getOrderDates = asyncHandler(async (req, res) => {
    res.status(200).json(OrderDates);
});

const getCancelDates = asyncHandler(async (req, res) => {
    res.status(200).json(cancelDate);
})

module.exports = {getCancelDates, getOrderDates ,deleteOrderById, getOrderDetails, getOrdersByTime, addOrder, getOrderByDate, getOrderHistory, cancelOrderById, cancelOrderByDate}