// routes/bookingRoutes.js
import express from 'express';
import { createBooking, rescheduleBooking, cancelBooking, getQRCode } from '../controllers/bookingController.js';

const router = express.Router();

router.post('/bookings', createBooking);
router.put('/bookings/:id', rescheduleBooking);
router.delete('/bookings/:id', cancelBooking);
router.get('/bookings/:id/qrcode', getQRCode);

export default router;
