const asyncHandler = require("express-async-handler")
const { dynamoClient } = require("../database/dbConfig");
const { v4: uuidv4 } = require('uuid');


const getAddressList = asyncHandler(async (req, res) => {

    const { cst_id } = req.body;
    if (!cst_id) {
        res.status(401);
        throw new Error("Unauthorised, customer ID missing");
    }
    else {
        console.log("Customer ID", cst_id);
        const params = {
            TableName: process.env.CUSTOMER_DETAILS,
            KeyConditionExpression: 'cst_id = :id',
            ExpressionAttributeValues: {
                ':id': cst_id,
            },
            ProjectionExpression: 'addr_lst'
        };
        try {
            dynamoClient.query(params, (err, data) => {
                if (err) {
                    res.status(500);
                    throw new Error(`Error querying table: ${cst_id}`, err)
                } else {
                    const addr_lst = data.Items.map(item => item.addr_lst);
                    console.log('Address list:', addr_lst);
                    if (addr_lst.length == 0) {
                        res.status(404).json({ result: "User not found" });
                    }
                    else {
                        res.status(200).json({ addr_lst: addr_lst[0] });
                    }
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
    const { cst_id, hs_nmbr, add_plc, stte, pncd, cty, add_typ } = req.body;
    if (!cst_id || !hs_nmbr || !add_plc || !stte || !pncd || !cty || !add_typ) {
        res.status(401);
        throw new Error("Unauthorised, fields are missing");
    }
    else {
        const add_id = uuidv4();
        console.log("fields", cst_id, hs_nmbr, add_plc, stte, pncd, cty, add_typ);
        const params = {
            TableName: process.env.CUSTOMER_DETAILS,
            Key: {
                cst_id: cst_id,
            },
            UpdateExpression: 'SET addr_lst = list_append(if_not_exists(addr_lst, :empty_list), :updated_values)',
            ExpressionAttributeValues: {
                ':empty_list': [],
                ':updated_values': [
                    {
                        addr_id: add_id,
                        addr_type: add_typ,
                        hs_nm: hs_nmbr,
                        state: stte,
                        city: cty,
                        pin: pncd,
                        add_line_1: add_plc
                    }
                ],
            },
        };

        try {
            dynamoClient.update(params, (err, data) => {
                if (err) {
                    res.status(500);
                    throw new Error(err)
                } else {
                    res.status(200).json({ result: "Address Added Successfully" })
                }
            });
        }
        catch (err) {
            res.status(500);
            throw new Error(err)
        }

    }

});


const updateAddress = asyncHandler(async (req, res) => {
    const { cst_id, add_id, hous_nmbr, add_plc, stte, pncd, cty, add_typ } = req.body;
    if (!cst_id) {
        res.status(401);
        throw new Error("Unauthoried, customer ID missing");
    }
    else if (!add_id) {
        res.status(401);
        throw new Error("Unauthoried, address ID missing");
    }
    else if (!hous_nmbr || !add_plc || !stte || !pncd || !cty || !add_typ) {
        res.status(401);
        throw new Error("Unauthorised, fields are missing");
    }
    else {
        console.log("Customer ID and Address ID", cst_id, add_id);
        const params = {
            TableName: process.env.CUSTOMER_DETAILS,
            KeyConditionExpression: 'cst_id = :id',
            ExpressionAttributeValues: {
                ':id': cst_id,
            },
            ProjectionExpression: 'addr_lst'
        };

        try {
            dynamoClient.query(params, (err, data) => {
                if (err) {
                    console.error('Error querying table:', err);
                    res.status(500);
                    throw new Error(err);
                } else {

                    const addr_lst = data.Items.map(item => item.addr_lst).flat();
                    console.log('Address list:', addr_lst);
                    const existingAddrIndex = addr_lst.findIndex(addr => {
                        console.log(addr);
                        return addr.addr_id === add_id;
                    });
                    console.log("existing index " + existingAddrIndex);
                    const updatedValues = {
                        addr_id: add_id,
                        addr_type: add_typ,
                        hs_nm: hous_nmbr,
                        state: stte,
                        city: cty,
                        pin: pncd,
                        add_line_1: add_plc
                    };
                    if (existingAddrIndex !== -1) {
                        // Update the existing order detail
                        addr_lst[existingAddrIndex] = {
                            ...addr_lst[existingAddrIndex],
                            ...updatedValues,
                        };
                        console.log('updated Address list:', addr_lst);
                        const updateParams = {
                            TableName: process.env.CUSTOMER_DETAILS,
                            Key: {
                                cst_id: cst_id,
                            },
                            UpdateExpression: 'SET addr_lst = :addr_lst',
                            ExpressionAttributeValues: {
                                ':addr_lst': addr_lst,
                            },
                        };

                        dynamoClient.update(updateParams, (updateErr, updateData) => {
                            if (updateErr) {
                                console.error('Error updating item:', updateErr);
                                res.status(500);
                                throw new Error(err);
                            } else {
                                console.log('Item updated successfully:', updateData);
                                res.status(200).json({ result: "success" });
                            }
                        });
                    }
                }
            });
        }
        catch (err) {
            res.status(500);
            throw new Error(err);
        }
    }
});

const deleteAddress = asyncHandler(async (req, res) => {

    const { cst_id, add_id } = req.body;
    if (!cst_id) {
        res.status(401);
        throw new Error("Unauthoried, customer ID missing");
    }
    else if (!add_id) {
        res.status(401);
        throw new Error("Unauthoried, address ID missing");
    }
    else {
        console.log("Customer ID and Address ID", cst_id, add_id);
        const params = {
            TableName: process.env.CUSTOMER_DETAILS,
            KeyConditionExpression: 'cst_id = :id',
            ExpressionAttributeValues: {
                ':id': cst_id,
            },
            ProjectionExpression: 'addr_lst'
        };
        try {
            dynamoClient.query(params, (err, data) => {
                if (err) {
                    console.error('Error querying table:', err);
                } else {
                    const addr_lst = data.Items.map(item => item.addr_lst).flat();
                    console.log('Address list:', addr_lst);
                    const existingAddrIndex = addr_lst.findIndex(addr => {
                        console.log(addr);
                        return addr.addr_id === add_id;
                    });
                    console.log("existing index " + existingAddrIndex);

                    const updatedValues = {
                        addr_id: add_id,
                        addr_type: "home",
                        hs_nm: "203",
                        state: "Maha",
                        city: "Pune",
                        pin: "411028",
                        add_line_1: "leisure town"
                    };
                    if (existingAddrIndex !== -1) {
                        const updateParams = {
                            TableName: process.env.CUSTOMER_DETAILS,
                            Key: {
                                cst_id: cst_id,
                            },
                            UpdateExpression: 'REMOVE addr_lst[' + existingAddrIndex + ']'
                        };

                        dynamoClient.update(updateParams, (updateErr, updateData) => {
                            if (updateErr) {
                                console.error('Error updating item:', updateErr);
                                res.status(500);
                                throw new Error(err);
                            } else {
                                console.log('Item deleted successfully:', updateData);
                                res.status(200).json({ result: "success" });
                            }
                        });

                    }
                }
            });
        }
        catch {
            res.status(500);
            throw new Error(err);
        }
    }
});

module.exports = { getAddressList, addAdress, updateAddress, deleteAddress }