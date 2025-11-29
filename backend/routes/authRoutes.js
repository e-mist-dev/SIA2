// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/google', authController.googleAuth);
router.post('/otp/request', authController.requestOtp);
router.post('/otp/verify', authController.verifyOtpAuth);

module.exports = router;
