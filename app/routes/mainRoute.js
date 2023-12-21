const express = require("express");
const router = express.Router();
const {health} = require('../controllers/healthController');
const {login, adduser, getUser} = require('../controllers/loginController')
const {getTodaymenu} = require('../controllers/menuController')
const validateToken = require("../middleware/validateTokenHandler");
const { getAddressList, addAdress, updateAddress, deleteAddress } = require("../controllers/addressController");
const { getOrderHistory } = require("../controllers/orderController");

router.get("/health", health);
router.get("/health-validation", validateToken, health);

router.post("/login", adduser)
router.get("/login", login)
router.get("/get-user", getUser)
router.get("/today-menu", getTodaymenu)
router.post("/add-user", adduser);
//address routers
router.get("/address-list", getAddressList);
router.post("/add-address", addAdress);
router.put("/update-address", updateAddress);
router.delete("/delete-address", deleteAddress);

// Order routers
router.get("/get-order-history", getOrderHistory)


module.exports = router;