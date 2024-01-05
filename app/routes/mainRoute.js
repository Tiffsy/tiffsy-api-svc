const express = require("express");
const router = express.Router();
const {health} = require('../controllers/healthController');
const {login, adduser, getUser, getCustomerIdbyPhone, getCustomerIdbyMail} = require('../controllers/loginController')
const {getTodaymenu, addMenu} = require('../controllers/menuController')
const validateToken = require("../middleware/validateTokenHandler");
const { getAddressList, addAdress, updateAddress, deleteAddress } = require("../controllers/addressController");
const {getOrderDates ,getOrderHistory, addOrder, deleteOrderById, cancelOrderById, cancelOrderByDate, getCancelDates} = require("../controllers/orderController");

router.get("/health", health);
router.get("/health-validation", validateToken, health);

router.post("/login", adduser)
router.get("/login", login)
router.get("/get-user", getUser)
router.get("/today-menu", getTodaymenu)

//Login routers
router.post("/add-user", adduser);
router.post("/get-cst-phone", getCustomerIdbyPhone);
router.post("/get-cst-mail", getCustomerIdbyMail);

//address routers
router.post("/address-list", getAddressList);
router.post("/add-address", addAdress);
router.put("/update-address", updateAddress);
router.delete("/delete-address", deleteAddress);

// Order routers
router.post("/get-order-history", getOrderHistory)
router.post("/add-new-order", addOrder);
router.delete("/delete-order-by-id", deleteOrderById)
router.post("/cancel-order-by-id",cancelOrderById)
router.post("/cancel-order-date", cancelOrderByDate);
router.post("/order-dates", getOrderDates);
router.post("/get-cancel-dates", getCancelDates)
module.exports = router;