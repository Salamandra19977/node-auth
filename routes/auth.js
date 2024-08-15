const express = require("express");
const authController = require("../controllers/auth.js");

const router = express.Router();

router.post('/registration', authController.registration)
router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;