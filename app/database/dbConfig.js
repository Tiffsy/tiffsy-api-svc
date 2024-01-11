const AWS = require("aws-sdk")

AWS.config.update({
    accessKeyId: process.env.AWS_SECRET_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT,
});

const db = new AWS.DynamoDB.DocumentClient({convertEmptyValues: true});
const dynamoClient = moClient = new AWS.DynamoDB.DocumentClient();

module.exports = {db, dynamoClient};