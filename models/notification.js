import { connectToDatabase } from '../config/db.js';

const Notification = {
  create: async ({ userId, type, message, read = 0 }) => {
    const db = await connectToDatabase();
    const [result] = await db.execute(
      `INSERT INTO notifications (user_id, type, message, read) VALUES (?, ?, ?, ?)`,
      [userId, type, message, read]
    );
    return result;
  },

  getAllByUser: async (userId) => {
    const db = await connectToDatabase();
    const [rows] = await db.execute(
      `SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  },

  markAsRead: async (id) => {
    const db = await connectToDatabase();
    const [result] = await db.execute(
      `UPDATE notifications SET read=1 WHERE id=?`,
      [id]
    );
    return result;
  },
};

export default Notification;
