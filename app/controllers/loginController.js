const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken");
const { dynamoClient } = require("../database/dbConfig");
const { v4: uuidv4 } = require('uuid');

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

function validatePhoneNumber(input_str) {
    input_str = String(input_str)
    var re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
    return re.test(input_str);
}

const user = {
    cst_id: "tayur6378iujnkjhasfajkaxxdf1?",
    cst_nm: "John Mill",
    cst_mail: "john@gmail.com"
}
const adduser = asyncHandler(async (req, res) => {
    const { cst_name, cst_mail, cst_contact } = req.body;
    if (!cst_name || !cst_mail || !cst_contact) {
        res.status(401);
        throw new Error("Unauthorised, customer ID missing");
    }
    else {
        const cst_id = uuidv4();
        const data = {
            cst_id: cst_id,
            cst_name: cst_name,
            cst_mail: cst_mail,
            cst_contact: cst_contact
        };
        const params = {
            TableName: process.env.CUSTOMER_LOGIN,
            Item: data
        };
        const response = await dynamoClient.put(params, (err, data) => {
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

const getUser = asyncHandler(async (req, res) => {
    // console.log("raj");
    const params = {
        TableName: process.env.CUSTOMER_DETAILS,
    }

    const response = await dynamoClient.scan(params).promise();
    res.status(200).json({ response });
})

const getCustomerIdbyPhone =  asyncHandler(async (req, res) => {
    
    const {cst_contact} = req.body;
    if (!cst_contact) {
        res.status(401);
        throw new Error("Unauthorised  ---> fields are missing");
    }
    else{

        const params = {
            TableName: process.env.CUSTOMER_LOGIN,
            IndexName: 'cst_contact-index',
            KeyConditionExpression: 'cst_contact = :value',
            ExpressionAttributeValues: {
                ':value': cst_contact,
            }
        }
        try {
            const response = await dynamoClient.query(params, (err, data) => {
                if (err) {
                    console.error('Error Fetch items:', err);
                    res.status(500);
                    throw new Error(err);
                } else {
                    res.status(200).json(data.Items[0]);
                }
            });
        }
        catch (err) {
            console.log(err);
            throw new Error("Error in db call")
        }
    }
})

const getCustomerIdbyMail =  asyncHandler(async (req, res) => {
    
    const {cst_mail} = req.body;
    if (!cst_mail) {
        res.status(401);
        throw new Error("Unauthorised  ---> fields are missing");
    }
    else{

        const params = {
            TableName: 'cstmr_login',
            IndexName: 'cst_mail-index',
            KeyConditionExpression: 'cst_mail = :value',
            ExpressionAttributeValues: {
                ':value': cst_mail,
            },
        };
        try {
            const response = await dynamoClient.query(params, (err, data) => {
                if (err) {
                    console.error('Error Fetch items:', err);
                    res.status(500);
                    throw new Error(err);
                } else {
                    res.status(200).json(data.Items[0]);
                }
            });
        }
        catch (err) {
            console.log(err);
            throw new Error("Error in db call")
        }
    }
})

const login = asyncHandler(async (req, res) => {
    
    const { cst_mail, cst_nmbr, cst_id } = req.body;
    if (!cst_mail && !cst_nmbr && !cst_id) {
        res.status(401);
        throw new Error("Unauthorised  ---> fields are missing");
    }
    else if (cst_mail && !cst_nmbr) {
        console.log(cst_mail, cst_nmbr);
        if (!validateEmail(cst_mail)) {
            res.status(401);
            throw new Error("Invalid Email ID");
        }
        else {
            const params = {
                TableName: process.env.CUSTOMER_DETAILS,
                IndexName: 'cst_mail-index',
                KeyConditionExpression: 'cst_mail = :cst_mail',
                ProjectionExpression: 'cst_nmbr',
                ExpressionAttributeValues: {
                    ":cst_mail": cst_mail
                },
            }
            try {
                const response = await dynamoClient.scan(params).promise();
                if (!repsone) {
                    res.status(500);
                    throw new Error("DynamoDB not sending response, email login response missing");
                }
                else {
                    const result = response.Item;
                    const token = jwt.sign({
                        user: {
                            userMail: result.cst_mail,
                            userName: result.cst_nm,
                            cstId: result.cst_id,
                        }
                    }, process.env.ACCESS_TOKEN_SECRET,
                        {
                            expiresIn: "500m"
                        });
                    res.status(200).json({ token });
                }
            }
            catch (err) {
                console.log(err);
                throw new Error("Error in db call")
            }
        }
    }
    else if (!cst_mail && cst_nmbr) {
        console.log(cst_mail, cst_nmbr);

        if (!validatePhoneNumber(cst_nmbr)) {
            res.status(401);
            throw new Error("Phone Number not valid");
        }
        else {
            const params = {
                TableName: process.env.CUSTOMER_DETAILS,
                Key: {
                    "cst_id": cst_id
                },
                ExpressionAttributeValues: {
                    "cst_nmbr": cst_nmbr
                },
            }
            try {
                const response = await dynamoClient.get(params).promise();
                if (!repsone) {
                    res.status(500);
                    throw new Error("DynamoDB not sending response, number login response missing");
                }
                else {
                    const result = response.Item;
                    const token = jwt.sign({
                        user: {
                            userNumber: result.cst_nmbr,
                            userName: result.cst_nm,
                            cstId: result.cst_id,
                        }
                    }, process.env.ACCESS_TOKEN_SECRET,
                        {
                            expiresIn: "500m"
                        });
                    res.status(200).json({ token });
                }
            }
            catch (err) {
                throw new Error("Error in db call")
            }
        }
    }
    else {
        res.status(500);
        throw new Error("Server error, no login res");
    }
})



module.exports = { login, adduser, getUser, getCustomerIdbyPhone, getCustomerIdbyMail};