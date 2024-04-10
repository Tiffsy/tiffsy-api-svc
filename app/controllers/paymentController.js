const asyncHandler = require("express-async-handler")
const { dynamoClient } = require("../database/dbConfig");

// Get all Transaction of Cst_id
const getPaymentHistory = asyncHandler(async (req, res) => {
  const { cst_id } = req.body

  const params = {
    TableName: process.env.TRANSACTION_DETAILS,
    KeyConditionExpression: 'cst_id = :pk', // remove addr_id condition if want to query based on cst_id only
    ExpressionAttributeValues: {
      ':pk': cst_id,
    }
  };
  const response = await dynamoClient.query(params, (err, data) => {
    if (err) {
      res.status(500);
      throw new Error(err);
    } else {
      res.status(200).json({ data: data.Items });
    }
  });
});

// Get Details of Transaction
const getTranscationDetails = asyncHandler(async (req, res) => {
  const { trns_id } = req.body
  const params = {
    TableName: process.env.TRANSACTION_DETAILS,
    IndexName: 'trn_id-index',
    KeyConditionExpression: 'trn_id = :value',
    ExpressionAttributeValues: {
      ':value': trns_id,
    },
  };
  const response = await dynamoClient.query(params, (err, data) => {
    if (err) {
      res.status(500);
      throw new Error(err);
    } else {
      res.status(200).json(data.Items);
    }
  });
});


// Add New Transaction
const addTransaction = asyncHandler(async (req, res) => {

  const { trn_id, sbcr_id, amt, cst_id, ts } = req.body;
  if (!trn_id || !sbcr_id || !amt || !cst_id || !ts) {
    res.status(401);
    throw new Error("Missing Fields");
  }
  else {
    const query = {
      trn_id: trn_id,
      sbcr_id: sbcr_id,
      amt: amt,
      cst_id: cst_id,
      ts: ts
    }
    const params = {
      TableName: process.env.TRANSACTION_DETAILS,
      Item: query
    };
    const respone = await dynamoClient.put(params, (err, data) => {
      if (err) {
        res.status(500);
        throw new Error(err);
      } else {
        res.status(200).json({ result: "SUCCESS" });
      }
    });
  }
});

const updateRefund = asyncHandler(async (req, res) => {
  const { cst_id, sbcr_id, amt } = req.body;
  if (!cst_id || !sbcr_id || !amt) {
    res.status(401);
    throw new Error("Missing Fields");
  }
  else {
    const tamt = parseInt(amt);
    const params = {
      TableName: process.env.SUBSCRITPTION_DETAILS,
      Key: {
        cst_id: cst_id,
        sbcr_id: sbcr_id,
      },
      UpdateExpression: 'SET refund_amt = refund_amt + :value1',
      ExpressionAttributeValues: {
        ':value1': tamt
      },
      ReturnValues: 'ALL_NEW'
    };
    const response = await dynamoClient.update(params, (err, data) => {
      if (err) {
        res.status(500);
        throw new Error(err);
      } else {
        res.status(200).json({ result: "SUCCESS" });
      }
    });
  }
});

const getRefundHistory = asyncHandler(async (req, res) => {

  res.status(200).json({
    "data": []
  });
})

module.exports = { getPaymentHistory, addTransaction, getTranscationDetails, updateRefund, getRefundHistory };