const express = require("express");
const authController = require("../controllers/auth");
const router = express.Router();


router.get('/registration', (req, res) => {
    res.sendFile("registration.html", { root: './resources/views' })
});
router.get('/', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        res.sendFile("profile.html", { root: './resources/views' })
    } else {
        res.sendFile("login.html", { root: './resources/views' });
    }
})
module.exports = router;