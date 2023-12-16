const asyncHandler = require('express-async-handler')
const {dynamoClient} = require('../database/dbConfig')
const member = 
    {
        id: "7",
        Name: 'Rainn',
        Surname: 'Scott',
        Gender: 'Male',
        Age: 24
    }

const menu = asyncHandler(async (req, res) => {

})
const addmenu = asyncHandler(async (req, res) => {

    const params = {
        TableName: "menu",
        Item: member
    }
    
    const respone = await dynamoClient.put(params).promise();
    res.status(200).json({respone});
});

module.exports = {menu, addmenu}