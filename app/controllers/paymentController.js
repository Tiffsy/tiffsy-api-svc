const asyncHandler = require("express-async-handler")
const { dynamoClient } = require("../database/dbConfig");

const getPaymentHistory = asyncHandler(async (req, res) =>{

});
const getRefund = asyncHandler(async (req, res) =>{

});
const paymentProcess = asyncHandler(async (req, res) =>{

});

module.exports = {getPaymentHistory}