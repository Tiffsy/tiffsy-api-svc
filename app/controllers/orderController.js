const asyncHandler = require("express-async-handler")
const { dynamoClient } = require("../database/dbConfig");
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

// convert ts to MM/DD/YYYY
function formatDate(dateStr) {
    let dt = new Date(dateStr);
    dt.setDate(dt.getDate());
    return dt.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }); // Format the date
}

function formatDateForTodayOrder(dateStr) {
    let dt = new Date(dateStr);
    return dt.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }); // Format the date
}

// Cancel Order By Date (cst_id, ordr_id)
const cancelOrderByDate = asyncHandler(async (req, res) => {
    const { cst_id, ordr_id, bc, lc, dc } = req.body;

    const lcnt = parseInt(lc);
    const bcnt = parseInt(bc);
    const dcnt = parseInt(dc);

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
                ':lc': lcnt,
                ':bc': bcnt,
                ':dc': dcnt
            },
        };
        const response = await dynamoClient.update(params, (err, data) => {
            if (err) {
                console.error('Error Fetch items:', err);
                res.status(500);
                throw new Error(err);
            } else {
                res.status(200).json({ result: 'SUCCESS' });
            }
        });
    }
});

// Get all subs of cst_id
const getSubscription = asyncHandler(async (req, res) => {
    const { cst_id } = req.body;
    if (!cst_id) {
        res.status(401);
        throw new Error("Unauthorised, customer ID missing");
    }
    else {
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

    const { cst_id, subs_id } = req.body;
    if (!cst_id || !subs_id) {
        res.status(401);
        throw new Error("Missing Fields");
    }
    else {
        const params = {
            TableName: process.env.CUSTOMER_ORDERS,
            IndexName: 'sbcr_id-index',
            KeyConditionExpression: 'sbcr_id = :subs_id',
            FilterExpression: 'cst_id = :cst_id',
            ExpressionAttributeValues: {
                ':subs_id': subs_id,
                ':cst_id': cst_id
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
        sbcr_id,
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
        subtype,
        remark,
        nickname,
        paymentId
    } = req.body;
    if (!cst_id || !sbcr_id || !str_dt || !end_dt || !cntct || !ts || !addr_line || !addr_id || !subtype) {
        res.status(401);
        throw new Error("Missing Fields")
    }
    else {
        const tbc = parseInt(bc);
        const tlc = parseInt(lc);
        const tdc = parseInt(dc);
        const tsubtype = parseInt(subtype);
        const tbill = parseInt(bill);
        const item = {
            cst_id: cst_id,
            str_dt: str_dt,
            end_dt: end_dt,
            sbcr_id: sbcr_id,
            bc: tbc,
            lc: tlc,
            dc: tdc,
            brkMealType: brkMealType,
            lchMealType: lchMealType,
            dinMealType: dinMealType,
            cntct: cntct,
            bill: tbill,
            ts: ts,
            addr_id: addr_id,
            addr_line, addr_line,
            subtype: tsubtype,
            remark: remark,
            nickname: nickname,
            refund_amt: 0,
            paymentId: paymentId
        }


        const params = {
            TableName: process.env.SUBSCRITPTION_DETAILS,
            Item: item
        };
        const response = await dynamoClient.put(params, async (err, data) => {
            if (err) {
                res.status(500);
                throw new Error(err)
            } else {
                try {
                    let itemToWrite = [];

                    const startDate = moment.parseZone(str_dt, 'YYYY-MM-DD HH:mm:ss.SSS').toDate();
                    const endDate = moment.parseZone(end_dt, 'YYYY-MM-DD HH:mm:ss.SSS').toDate();
                    for (let current = new Date(startDate); current <= endDate; current.setDate(current.getDate() + 1)) {
                        let meal_date = formatDate(current.toISOString());
                        const order_id = uuidv4();
                        let tmp = {
                            cst_id: cst_id,
                            sbcr_id: sbcr_id,
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
                            dinMealType: dinMealType,
                            ordr_date: meal_date
                        };
                        itemToWrite.push(tmp);
                    }
                    const batches = [];
                    for (let i = 0; i < itemToWrite.length; i += 25) {
                        batches.push(itemToWrite.slice(i, i + 25));
                    }
                    for (const batch of batches) {
                        const params = {
                            RequestItems: {
                                [process.env.CUSTOMER_ORDERS]: batch.map(item => ({
                                    PutRequest: {
                                        Item: item,
                                    },
                                })),
                            },
                        };
                        await dynamoClient.batchWrite(params).promise();
                    }

                    res.status(200).json({ result: "SUCCESS" });
                }
                catch (err) {
                    res.status(500);
                    throw new Error(err);
                }
            }
        });

    }
});

const todayOrder = asyncHandler(async (req, res) => {

    const { cst_id, str_dt, cntct, bill, ts, addr_line, addr_id, ordr, remark } = req.body;
    if (!cst_id || !str_dt || !cntct || !ts || !addr_line || !addr_id || !bill || !ordr) {
        res.status(401);
        throw new Error("Missing Fields")
    }
    else {
        try{    
        const ordrs = JSON.parse(ordr);
        let itemToWrite = [];
        let meal_date = formatDateForTodayOrder(str_dt);
        let orderList = [
            {
                meal_time: "breakfast",
                cst_id: cst_id,
                dt: str_dt,
                cntct: cntct,
                ordr_id: "",
                addr_line: addr_line,
                addr_id: addr_id,
                remark: remark,
                reg_cnt: 0,
                mini_cnt: 0,
                spl_cnt: 0,
                trn_id : "dummy",
                meal_dt: meal_date

            }, 
            {
                meal_time: "lunch",
                cst_id: cst_id,
                dt: str_dt,
                cntct: cntct,
                ordr_id: "",
                addr_line: addr_line,
                addr_id: addr_id,
                remark: remark,
                reg_cnt: 0,
                mini_cnt: 0,
                spl_cnt: 0,
                trn_id : "dummy",
                meal_dt: meal_date
            }, 
            {
                meal_time: "dinner",
                cst_id: cst_id,
                dt: str_dt,
                cntct: cntct,
                ordr_id: "",
                addr_line: addr_line,
                addr_id: addr_id,
                remark: remark,
                reg_cnt: 0,
                mini_cnt: 0,
                spl_cnt: 0,
                trn_id : "dummy",
                meal_dt: meal_date
            }
        ];
        for (const order of ordrs) {
            const index = order["mealTime"] == "breakfast" ? 0 : (order["mealTime"] == "lunch" ? 1 : 2);
            orderList[index].reg_cnt += order["mealType"] == "regular" ? order["count"] : 0;
            orderList[index].mini_cnt += order["mealType"] == "mini" ? order["count"] : 0;
            orderList[index].spl_cnt += order["mealType"] == "special" ? order["count"] : 0;
            orderList[index].ordr_id = uuidv4();
        }
        for (const order of orderList) {
            if (order.mini_cnt + order.reg_cnt + order.spl_cnt > 0) {
                itemToWrite.push(order);
            }
        }
        const batches = [];
        for (let i = 0; i < itemToWrite.length; i += 25) {
            batches.push(itemToWrite.slice(i, i + 25));
        }
        for (const batch of batches) {
            const params = {
                RequestItems: {
                    [process.env.SUBSCRIPTIONLESS_ORDERS]: batch.map(item => ({
                        PutRequest: {
                            Item: item,
                        },
                    })),
                },
            };
            try{
                await dynamoClient.batchWrite(params).promise();
            }
            catch(err){
            }
        }
        res.status(200).json({ result: "SUCCESS" });
    }
    catch(err){
        res.status(500);
        throw new Error(err);
    }
    }
});

const getTodayOrder = asyncHandler(async (req, res) => {

    const {cst_id} = req.body;
    if(!cst_id){
        res.status(401);
        throw new Error("Missing Fields")
    }
    else{
        try{
        const params = {
            TableName: process.env.SUBSCRIPTIONLESS_ORDERS,
            IndexName: 'cst_id-index',
            KeyConditionExpression: 'cst_id = :value',
            ExpressionAttributeValues: {
                ':value': cst_id,
            },
          };
          const response = await dynamoClient.query(params, (err, data) => {
            if (err) {
                res.status(500);
                throw new Error(err);
            } else {
                res.status(200).json({ result: 'SUCCESS', data: data["Items"]});
            }
          });
        }
        catch(err){
            res.status(500)
            throw new Error(err);
        }
    }
})

module.exports = { getOrderBySubsId, cancelOrderByDate, getSubscription, addSubscription, todayOrder, getTodayOrder}