import Notification from '../models/notification.js';

/**
 * Send a custom notification (optional endpoint)
 * POST /notifications
 */
export const sendNotification = async (req, res) => {
  try {
    const { userId, type, message } = req.body;
    if (!userId || !type || !message) {
      return res.status(400).json({ message: 'userId, type, and message are required' });
    }

    const notification = await Notification.create({ userId, type, message });
    res.json({ message: 'Notification sent', notification });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Error sending notification', error: error.message });
  }
};

/**
 * Get all notifications for a user
 * GET /notifications/:userId
 */
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const notifications = await Notification.getAllByUser(userId);
    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

/**
 * Mark a notification as read
 * PUT /notifications/:id/read
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Notification.markAsRead(id);
    res.json({ message: 'Notification marked as read', result });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};

/**
 * Helper function for booking notifications
 * Use inside bookingController
 */
export const notifyBookingAction = async (booking, action) => {
  // Extract data from booking
  const { student_id: studentId, instructor_id: instructorId, lesson_id: lessonId, date, time } = booking;

  let studentMessage = '';
  let instructorMessage = '';

  switch (action) {
    case 'create':
      studentMessage = `Your booking for lesson ${lessonId} on ${date} at ${time} has been created`;
      instructorMessage = `New booking for lesson ${lessonId} with student ${studentId} on ${date} at ${time}`;
      break;
    case 'reschedule':
      studentMessage = `Your booking for lesson ${lessonId} has been rescheduled to ${date} at ${time}`;
      instructorMessage = `Booking with student ${studentId} for lesson ${lessonId} has been rescheduled to ${date} at ${time}`;
      break;
    case 'cancel':
      studentMessage = `Your booking for lesson ${lessonId} on ${date} at ${time} has been canceled`;
      instructorMessage = `Booking with student ${studentId} for lesson ${lessonId} on ${date} at ${time} has been canceled`;
      break;
    default:
      return;
  }

  // Create notifications
  await Notification.create({ userId: studentId, type: 'booking', message: studentMessage });
  await Notification.create({ userId: instructorId, type: 'booking', message: instructorMessage });
};
