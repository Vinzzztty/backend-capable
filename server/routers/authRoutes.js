const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.post("/check-account", authController.checkAccount);

router.post("/verify", authController.verify);

router.get("/data", authController.getUserDetails);

router.post("/logout", authController.logout);

module.exports = router;
