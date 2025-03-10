const asyncHandler = require('express-async-handler')
const {dynamoClient} = require('../database/dbConfig')
const moment = require('moment-timezone');

const getTodaymenu = asyncHandler(async (req, res) => {  
    const {dt} = req.body;
    try{
        const params = {
            TableName: process.env.MENU_HIST,
            KeyConditionExpression: 'datestmp = :pk',
            ExpressionAttributeValues: {
                ':pk': dt,
            }
        };
        const response = await dynamoClient.query(params, (err, data) => {
            if (err) {
                res.status(500);
                throw new Error(err);
            } 
            else {
                data = data.Items;
                for(let i = 0; i < data.length; i++){
                    let tmp = data[i]['mealType'].split(' ');
                    data[i]['mealType'] = tmp[0];
                }
                res.status(200).json(data);
            }
        });
    }
    catch(err){
        res.status(500);
        throw new Error(err)
    }
});

const addMenu = asyncHandler(async (req, res) => {

    const menu = req.body
   
    try{
        let itemToWrite = [];
        const currentDateTime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
        for(let i = 0; i < menu.length; i++){
            let tmp = {
                PutRequest: {
                    Item: {
                        datestmp: currentDateTime.split('T')[0],
                        title: menu[i].title,
                        price: menu[i].price,
                        description: menu[i].description,
                        mealType: menu[i].mealType+' '+menu[i].mealTime,
                        mealTime: menu[i].mealTime,
                    }
                }
            };
            itemToWrite.push(tmp);
        }
        // console.log(itemToWrite);
        const batchWriteParams = {
            RequestItems: {
                [process.env.MENU_HIST]: itemToWrite
            },
          };
         
          dynamoClient.batchWrite(batchWriteParams, (err, data) => {
            if (err) {
                res.status(500);
                throw new Error(err);
            } else {
                res.status(200).json({result: "SUCCESS"});
            }
          });
    }
    catch(err){
        res.status(500);
        throw new Error(err);
    }
});

module.exports = {getTodaymenu, addMenu}
  
