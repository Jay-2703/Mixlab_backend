// controllers/bookingController.js
import Booking from '../models/booking.js';
import QRCode from 'qrcode';
import Notification from '../models/notification.js';

export const createBooking = async (req, res) => {
  try {
    const { studentId, instructorId, lessonId, date, time } = req.body;

    // check for conflicts
    const conflict = await Booking.checkConflict({ instructorId, date, time });
    if (conflict) return res.status(400).json({ message: 'Time slot already booked' });

    // generate QR code data (optional: include booking info)
    const qrData = `booking:${studentId}-${lessonId}-${date}-${time}`;
    const qrCode = await QRCode.toDataURL(qrData);

    const booking = await Booking.create({ studentId, instructorId, lessonId, date, time, qrCode });

    // Trigger notifications AFTER booking is created
    await Notification.create({
      userId: studentId,          // student gets notification
      type: 'booking',
      message: `Your booking for lesson ${lessonId} on ${date} at ${time} has been created`
    });

    await Notification.create({
      userId: instructorId,       // instructor gets notification
      type: 'booking',
      message: `New booking for lesson ${lessonId} with student ${studentId} on ${date} at ${time}`
    });

    res.json({ message: 'Booking created', booking });
  } catch (error) {
  console.error('Booking creation error:', error);
  res.status(500).json({ message: 'Error creating booking', error: error.message });
}

};

export const rescheduleBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    // Get booking
    const booking = await Booking.getById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check for conflicts
    const conflict = await Booking.checkConflict({ instructorId: booking.instructor_id, date, time });
    if (conflict) return res.status(400).json({ message: 'Time slot already booked' });

    await Booking.update(id, { date, time });

    // After successfully rescheduling
    await Notification.create({
      userId: studentId,
      type: 'booking',
      message: `Your booking for lesson ${lessonId} has been rescheduled to ${date} at ${time}`
    });

    await Notification.create({
      userId: instructorId,
      type: 'booking',
      message: `Booking with student ${studentId} for lesson ${lessonId} has been rescheduled to ${date} at ${time}`
    });



    res.json({ message: 'Booking rescheduled' });
  } catch (error) {
    console.error('Reschedule error:', error);
    res.status(500).json({ message: 'Error rescheduling booking', error: error.message });
  }
};



export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await Booking.delete(id);

    // After successfully canceling
    await Notification.create({
      userId: studentId,
      type: 'booking',
      message: `Your booking for lesson ${lessonId} on ${date} at ${time} has been canceled`
    });

    await Notification.create({
      userId: instructorId,
      type: 'booking',
      message: `Booking with student ${studentId} for lesson ${lessonId} on ${date} at ${time} has been canceled`
    });

    res.json({ message: 'Booking canceled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error canceling booking' });
  }
};


export const getQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.getById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json({ qrCode: booking.qr_code });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating QR code' });
  }
};
