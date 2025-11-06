import express from 'express';
import { login, register } from '../controllers/authController.js';
import { forgotPassword, verifyOtp, resetPassword, logout } from '../controllers/authController.js';




//Guest
import guestTracking from '../middleware/guestTracking.js';
//import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// Auth routes and password reset - DONE TESTING
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);   // send OTP
router.post('/verify-otp', verifyOtp);            // check OTP
router.post('/reset-password', resetPassword);    // set new password
router.post('/logout', logout);



//GUEST 
//router.post('/register', guestTracking, registerUser);
//router.post('/login', guestTracking, loginUser);



export default router;
