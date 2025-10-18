import express from 'express';
import { login, register } from '../controllers/authController.js';
import { forgotPassword, verifyOtp, resetPassword } from '../controllers/authController.js';


const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);

//password reset
router.post('/forgot-password', forgotPassword);   // send OTP
router.post('/verify-otp', verifyOtp);            // check OTP
router.post('/reset-password', resetPassword);    // set new password


export default router;
