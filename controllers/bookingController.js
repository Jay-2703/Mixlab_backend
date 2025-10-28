// controllers/bookingController.js
import Booking from '../models/booking.js';
import QRCode from 'qrcode';
import Notification from '../models/notification.js';

export const createBooking = async (req, res) => {
  try {
    const { user_id, lesson_id, booking_date } = req.body;

    // (optional) check conflict if same lesson/time already booked
    const conflict = await Booking.checkConflict({ lesson_id, booking_date });
    if (conflict)
      return res.status(400).json({ message: 'Time slot already booked' });

    // generate QR code
    const qrData = `booking:${user_id}-${lesson_id}-${booking_date}`;
    const qrCode = await QRCode.toDataURL(qrData);

    // create booking
    const booking = await Booking.create({
      user_id,
      lesson_id,
      booking_date,
      qr_code: qrCode
    });

    // notify student
    await Notification.create({
      userId: user_id,
      type: 'booking',
      message: `Your booking for lesson ${lesson_id} on ${booking_date} has been created.`
    });

    // notify instructor (fetched from lesson)
    const lesson = await Booking.getLessonInstructor(lesson_id);
    if (lesson?.instructor_id) {
      await Notification.create({
        userId: lesson.instructor_id,
        type: 'booking',
        message: `A student booked your lesson (${lesson_id}) on ${booking_date}.`
      });
    }

    res.json({ message: 'Booking created', booking });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      message: 'Error creating booking',
      error: error.message
    });
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
