const express = require("express");
const router = express.Router();
const { health } = require('../controllers/healthController');
const { login, adduser, getUser, getCustomerIdbyPhone, getCustomerIdbyMail, deleteUser } = require('../controllers/loginController')
const { getTodaymenu, addMenu } = require('../controllers/menuController')
const validateToken = require("../middleware/validateTokenHandler");
const { getAddressList, addAdress } = require("../controllers/addressController");
const { cancelOrderByDate, getSubscription, getOrderBySubsId, addSubscription, todayOrder, getTodayOrder} = require("../controllers/orderController");
const { getTranscationDetails, addTransaction, getPaymentHistory, updateRefund, getRefundHistory } = require("../controllers/paymentController");
const { getCoupons, couponApplied, addCoupons } = require("../controllers/couponController");

router.get("/health", health);
router.get("/health-validation", validateToken, health);

// Menu routers
router.post("/add-menu", addMenu);
router.post("/today-menu", getTodaymenu);

//Login routers
router.post("/add-user", adduser);
router.post("/get-cst-phone", getCustomerIdbyPhone);
router.post("/get-cst-mail", getCustomerIdbyMail);
router.post("/get-token", login)
router.post("/delete-user", validateToken, deleteUser);

//address routers
router.post("/address-list", validateToken, getAddressList);
router.post("/add-address", validateToken, addAdress);

// Order routers
router.post("/cancel-order-date", validateToken, cancelOrderByDate);
router.post("/get-subcription", validateToken, getSubscription)
router.post("/get-order-by-Subscription", validateToken, getOrderBySubsId)
router.post("/add-subscription", validateToken, addSubscription);
router.post("/today-order", validateToken, todayOrder)
router.post("/get-order-history", validateToken, getTodayOrder);

// Transaction Details
router.post("/get-trxn-by-id", validateToken, getTranscationDetails)
router.post("/add-trxn", validateToken, addTransaction)
router.post("/get-trnx-history", validateToken, getPaymentHistory)
router.post("/update-refund", validateToken, updateRefund)
router.post("/get-refund-history", validateToken, getRefundHistory)


// Coupons routers
router.post("/get-coupons", validateToken, getCoupons);
router.post("/coupon-applied", validateToken, couponApplied);
router.post("/add-coupon", validateToken, addCoupons);



module.exports = router;
