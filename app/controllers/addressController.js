const asyncHandler = require("express-async-handler")
const { dynamoClient } = require("../database/dbConfig");
const { v4: uuidv4 } = require('uuid');



// Get all Address of cst_id
const getAddressList = asyncHandler(async (req, res) => {
    const { cst_id } = req.body;
    if (!cst_id) {
        res.status(401);
        throw new Error("Unauthorised, customer ID missing");
    }
    else {
        const params = {
            TableName: process.env.CUSTOMER_ADDRESS,
            KeyConditionExpression: 'cst_id = :pk', //AND addr_id = :sk', // remove addr_id condition if want to query based on cst_id only
            ExpressionAttributeValues: {
                ':pk': cst_id,
                //':sk': '1', // remove this also if want to query based on cst_id only
        }};
        try {
            const response = await dynamoClient.query(params, (err, data) => {
                if (err) {
                    res.status(500);
                    throw new Error(err);
                } else {
                    res.status(200).json(data["Items"]);
                }
            });              
        }
        catch (err) {
            res.status(500)
            throw new Error(err);
        }
    }
});

const addAdress = asyncHandler(async (req, res) => {

    const { cst_id, addr_id, house_num, addr_line, state, pin, city, contact, addr_type } = req.body;
    if (!cst_id || !addr_id || !house_num || !addr_line || !state || !pin || !city || !addr_type) {
        res.status(401);
        throw new Error("Unauthorised, fields are missing");
    }
    else {
        const addrId = uuidv4();
        const data = {
            cst_id: cst_id,
            addr_id: addrId,
            house_num: house_num,
            addr_line: addr_line,
            state: state,
            pin: pin,
            city: city,
            contact: contact,
            addr_type: addr_type
        }

        
        const params = {
            TableName: process.env.CUSTOMER_ADDRESS,
            Item: data,
            ConditionExpression: 'attribute_not_exists(cst_id) AND attribute_not_exists(addr_id)' // remove, if you want to update the item based on cst_id, and addr_id
        };
        try {
            dynamoClient.put(params, (err, data) => {
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
                    res.status(200).json({ result: "SUCCESS", data});
                }
            });
        }
        catch (err) {
            res.status(500);
            throw new Error(err)
        }
    }
});


// const updateAddress = asyncHandler(async (req, res) => {
//     const { cst_id, add_id, hous_nmbr, add_plc, stte, pncd, cty, add_typ } = req.body;
//     if (!cst_id) {
//         res.status(401);
//         throw new Error("Unauthoried, customer ID missing");
//     }
//     else if (!add_id) {
//         res.status(401);
//         throw new Error("Unauthoried, address ID missing");
//     }
//     else if (!hous_nmbr || !add_plc || !stte || !pncd || !cty || !add_typ) {
//         res.status(401);
//         throw new Error("Unauthorised, fields are missing");
//     }

//     else {
//         console.log("Customer ID and Address ID", cst_id, add_id);
//         const params = {
//             TableName: process.env.CUSTOMER_DETAILS,
//             KeyConditionExpression: 'cst_id = :id',
//             ExpressionAttributeValues: {
//                 ':id': cst_id,
//             },
//             ProjectionExpression: 'addr_lst'
//         };

//         try {
//             dynamoClient.query(params, (err, data) => {
//                 if (err) {
//                     console.error('Error querying table:', err);
//                     res.status(500);
//                     throw new Error(err);
//                 } else {

//                     const addr_lst = data.Items.map(item => item.addr_lst).flat();
//                     console.log('Address list:', addr_lst);
//                     const existingAddrIndex = addr_lst.findIndex(addr => {
//                         console.log(addr);
//                         return addr.addr_id === add_id;
//                     });
//                     console.log("existing index " + existingAddrIndex);
//                     const updatedValues = {
//                         addr_id: add_id,
//                         addr_type: add_typ,
//                         hs_nm: hous_nmbr,
//                         state: stte,
//                         city: cty,
//                         pin: pncd,
//                         add_line_1: add_plc
//                     };
//                     if (existingAddrIndex !== -1) {
//                         // Update the existing order detail
//                         addr_lst[existingAddrIndex] = {
//                             ...addr_lst[existingAddrIndex],
//                             ...updatedValues,
//                         };
//                         console.log('updated Address list:', addr_lst);
//                         const updateParams = {
//                             TableName: process.env.CUSTOMER_DETAILS,
//                             Key: {
//                                 cst_id: cst_id,
//                             },
//                             UpdateExpression: 'SET addr_lst = :addr_lst',
//                             ExpressionAttributeValues: {
//                                 ':addr_lst': addr_lst,
//                             },
//                         };

//                         dynamoClient.update(updateParams, (updateErr, updateData) => {
//                             if (updateErr) {
//                                 console.error('Error updating item:', updateErr);
//                                 res.status(500);
//                                 throw new Error(err);
//                             } else {
//                                 console.log('Item updated successfully:', updateData);
//                                 res.status(200).json({ result: "success" });
//                             }
//                         });
//                     }
//                 }
//             });
//         }
//         catch (err) {
//             res.status(500);
//             throw new Error(err);
//         }
//     }
// });

// const deleteAddress = asyncHandler(async (req, res) => {

//     const { cst_id, addr_id } = req.body;
//     if (!cst_id) {
//         res.status(401);
//         throw new Error("Unauthoried, customer ID missing");
//     }
//     else if (!addr_id) {
//         res.status(401);
//         throw new Error("Unauthoried, address ID missing");
//     }
//     else {
//         try {
//             const params = {
//                 TableName: process.env.CUSTOMER_ADDRESS,
//                 Key: {
//                     cst_id: cst_id,
//                     addr_id: addr_id
//                 }
//             };
//             const response = dynamoClient.delete(params, (err, data) => {
//                 if (err) {
//                     console.error('Error deleting item:', err);
//                     res.status(500);
//                     throw new Error(err);
//                 } else {
//                     res.status(200).json({ result: 'SUCCESS' });
//                 }
//             });
//         }
//         catch {
//             res.status(500);
//             throw new Error(err);
//         }
//     }
// });

module.exports = { getAddressList, addAdress}