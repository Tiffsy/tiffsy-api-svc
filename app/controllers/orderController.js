const asyncHandler = require("express-async-handler")
const { dynamoClient } = require("../database/dbConfig");
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');


// Cancel Order By Date (cst_id, ordr_id)
const cancelOrderByDate = asyncHandler(async (req, res) => {
    const { cst_id, ordr_id, bc, lc, dc } = req.body;
    console.log(req.body);
    if (!cst_id || !ordr_id) {
        res.status(401);
        throw new Error("Missing fields");
    }
    else {
        const params = {
            TableName: process.env.CUSTOMER_ORDERS,
            Key: {
                cst_id: cst_id,
                ordr_id: ordr_id
            },
            UpdateExpression: 'SET lc = :lc, bc = :bc, dc = :dc',
            ExpressionAttributeValues: {
                ':lc': lc,
                ':bc': bc,
                ':dc': dc
            },
        };
        const response = await dynamoClient.update(params, (err, data) => {
            if (err) {
                console.error('Error Fetch items:', err);
                res.status(500);
                throw new Error(err);
            } else {
                res.status(200).json({ result: 'SUCCESS'});
            }
        });
    }
});

// Get all subs of cst_id
const getSubscription = asyncHandler(async (req, res) => {
    const {cst_id} = req.body;
    if (!cst_id) {
        res.status(401);
        throw new Error("Unauthorised, customer ID missing");
    }
    else{
        const params = {
            TableName: process.env.SUBSCRITPTION_DETAILS,
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
                    res.status(200).json({ result: 'SUCCESS', data: data["Items"] });
                }
            });
        }
        catch (err) {
            res.status(500)
            throw new Error(err);
        }
    }

});

//Get Order List of paricular Subs
const getOrderBySubsId = asyncHandler(async (req, res) => {

    const {cst_id, subs_id} = req.body;
    if(!cst_id || !subs_id){
        res.status(401);
        throw new Error("Missing Fields");
    }
    else{
        const params = {
            TableName: process.env.CUSTOMER_ORDERS,
            KeyConditionExpression: 'cst_id = :pk AND scbr_id = :sk',
            ExpressionAttributeValues: {
                ':pk': cst_id,
                ':sk': subs_id
                //':sk': '1', // remove this also if want to query based on cst_id only
            }
        };
        try {
            const response = await dynamoClient.query(params, (err, data) => {
                if (err) {
                    res.status(500);
                    throw new Error(err);
                } else {
                    res.status(200).json({ result: 'SUCCESS', data: data["Items"] });
                }
            });
        }
        catch (err) {
            res.status(500)
            throw new Error(err);
        }
    }
});

// Add new Subs with order
const addSubscription = asyncHandler(async (req, res) => {
    const { 
        cst_id, 
        str_dt, 
        end_dt, 
        bc, 
        lc, 
        dc, 
        brkMealType, 
        lchMealType, 
        dinMealType, 
        cntct, 
        bill, 
        ts, 
        addr_line, 
        addr_id, 
        subtype 
    } = req.body;


    if (!cst_id || !str_dt || !end_dt || !brkMealType || !lchMealType || !dinMealType || !cntct ||  !ts || !addr_line || !addr_id || !subtype) {
        res.status(401);
        throw new Error("Missing Fields")
    }
    else {

        const subs_id = uuidv4();
        const item = {
            cst_id: cst_id,
            str_dt: str_dt,
            end_dt: end_dt,
            sbcr_id: subs_id,
            bc: bc,
            lc: lc,
            dc: dc,
            brkMealType: brkMealType,
            lchMealType: lchMealType,
            dinMealType: dinMealType,
            cntct: cntct,
            bill: bill,
            ts: ts,
            addr_id: addr_id,
            addr_line, addr_line,
            subtype: subtype
        }
        const params = {
            TableName: process.env.SUBSCRITPTION_DETAILS,
            Item: item
        };
        const response = await dynamoClient.put(params, (err, data) => {
            if (err) {
                res.status(500);
                throw new Error(err)

            } else {
                let itemToWrite = [];
                console.log(str_dt);
                const startDate = moment(str_dt, 'YYYY-MM-DDTHH:mm:ss.SSSZ').toDate();
                const endDate = moment(end_dt, 'YYYY-MM-DDTHH:mm:ss.SSSZ').toDate();
                console.log(startDate, endDate);
                for (let current = new Date(startDate); current <= endDate; current.setDate(current.getDate() + 1)) {
                    const order_id = uuidv4();
                    let tmp = {
                        PutRequest: {
                            Item: {
                                cst_id: cst_id,
                                subId: subs_id,
                                ordr_id: order_id,
                                dt: current.toISOString(),
                                bc: bc,
                                lc: lc,
                                dc: dc,
                                cntct: cntct,
                                addr: addr_line,
                                addr_id: addr_id,
                                brkMealType: brkMealType,
                                lchMealType: lchMealType,
                                dinMealType: dinMealType
                            }
                        }
                    };
                    itemToWrite.push(tmp);
                }
                console.log(itemToWrite);
                const batchWriteParams = {
                    RequestItems: {
                        [process.env.CUSTOMER_ORDERS]: itemToWrite
                    }
                }
                dynamoClient.batchWrite(batchWriteParams, (err, data) => {
                    if (err) {
                        res.status(500);
                        throw new Error(err);
                    } else {
                        res.status(200).json({ result: "SUCCESS" });
                    }
                })
            }
        });

    }
});

module.exports = { getOrderBySubsId, cancelOrderByDate, getSubscription, addSubscription }