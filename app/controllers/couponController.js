const asyncHandler = require("express-async-handler")
const { dynamoClient } = require("../database/dbConfig");
const { v4: uuidv4 } = require('uuid');

const getCoupons = asyncHandler(async (req, res) => {
    const { cst_id } = req.body;
    if (!cst_id) {
        res.status(401);
        throw new Error("Unauthorised, fields are missing");
    }
    else {
        try {
            const params = {
                TableName: process.env.CUSTOMER_COUPONS,
                KeyConditionExpression: 'cst_id = :pk',
                FilterExpression: 'cpn_cnt > :cnt',
                ExpressionAttributeValues: {
                    ':pk': cst_id,
                    ':cnt': 0
                }
            };
            const response = await dynamoClient.query(params, (err, data) => {
                if (err) {
                    res.status(500);
                    throw new Error(err);
                } else {
                    console.log(data);
                    res.status(200).json(data["Items"]);
                }
            });
        }
        catch (err) {
            res.status(500);
            throw new Error(err);
        }
    }
});
const addCoupons = asyncHandler(async (req, res) => {
    const { cst_id, cpn_code, cnt, expire_dt, discount_prnct, min_price, max_discount} = req.body;
    if (!cst_id || cpn_code || !cnt || !expire_dt ||!price || !discount_prnct || !min_price || !max_discount) {
        res.status(401);
        throw new Error("Unauthorised, fields are missing");
    }
    else {
        try {
            const data = {
                cst_id: cst_id,
                cpn_code: cpn_code,
                cpn_cnt: cnt,
                expiry_dt: expire_dt,
                discount_prnct: discount_prnct,
                min_price: min_price,
                max_discount: max_discount
            };
            const params = {
                TableName: process.env.CUSTOMER_COUPONS,
                Item: data
            };
            const response = await dynamoClient.put(params, (err, data) => {
                if (err) {
                    if (err.statusCode == 400) {
                        res.status(400);
                        throw new Error(err)
                    }
                    else {
                        res.status(500);
                        throw new Error(err)
                    }
                } else {
                    res.status(200).json({ result: "SUCCESS", data });
                }
            });
        }
        catch (err) {
            res.status(500);
            throw new Error(err);
        }
    }
});
const couponApplied = asyncHandler(async (req, res) => {

    const { cst_id, cpn_code } = req.body;
    if (!cst_id || !cpn_code) {
        res.status(401);
        throw new Error("Unauthorised, customer ID missing");
    }
    else {

        try {
            const params = {
                TableName: process.env.CUSTOMER_COUPONS,
                Key: {
                    cst_id: cst_id,
                    cpn_code: cpn_code,
                },
                UpdateExpression: 'SET cpn_cnt = cpn_cnt - :value1',
                ExpressionAttributeValues: {
                    ':value1': 1
                },
                ReturnValues: 'ALL_NEW'
            };
            const response = await dynamoClient.update(params, (err, data) => {
                if (err) {
                    if (err.statusCode == 400) {
                        res.status(400);
                        throw new Error(err)
                    }
                    else {
                        res.status(500);
                        throw new Error(err)
                    }
                } else {
                    res.status(200).json({ result: "SUCCESS", data });
                    
                }
            });
        }
        catch (err) {
            res.status(500);
            throw new Error(err);
        }
    }
});
module.exports = { getCoupons, couponApplied, addCoupons };