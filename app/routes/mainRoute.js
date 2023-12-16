const express = require("express");
const router = express.Router();
const {health} = require('../controllers/healthController');
const {login, adduser, getUser} = require('../controllers/loginController')
const {addmenu} = require('../controllers/menuController')
const validateToken = require("../middleware/validateTokenHandler");

router.get("/health", health);
router.get("/health-validation", validateToken, health);

router.post("/login", adduser)
router.get("/login", login)
router.get("/get-user", getUser)


router.post("/today-menu", addmenu);


module.exports = router