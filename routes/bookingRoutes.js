// routes/bookingRoutes.js
import express from 'express';
import { createBooking, rescheduleBooking, cancelBooking, getQRCode, getBookingsByUser, checkInBooking } from '../controllers/bookingController.js';

const router = express.Router();


// Create booking
router.post('/', createBooking);

// Check-in endpoint (specific, before :id routes)
router.post('/checkin', checkInBooking);

// Get bookings for user (specific, before :id routes)
router.get('/user/:userId', getBookingsByUser);

// Get QR code (specific pattern)
router.get('/:id/qrcode', getQRCode);

// Update booking
router.put('/:id', rescheduleBooking);

// Delete booking
router.delete('/:id', cancelBooking);

export default router;