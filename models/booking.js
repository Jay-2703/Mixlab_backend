// models/booking.js
import { connectToDatabase } from '../config/db.js';

const Booking = {
  create: async ({ studentId, instructorId, lessonId, date, time, qrCode }) => {
    const db = await connectToDatabase(); // get the connection
    const [result] = await db.execute(
      `INSERT INTO bookings (student_id, instructor_id, lesson_id, date, time, qr_code) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [studentId, instructorId, lessonId, date, time, qrCode]
    );
    return result;
  },

  update: async (id, { date, time }) => {
    const db = await connectToDatabase();
    const [result] = await db.execute(
      `UPDATE bookings SET date=?, time=? WHERE id=?`,
      [date, time, id]
    );
    return result;
  },

  delete: async (id) => {
    const db = await connectToDatabase();
    const [result] = await db.execute(`DELETE FROM bookings WHERE id=?`, [id]);
    return result;
  },

  getById: async (id) => {
    const db = await connectToDatabase();
    const [rows] = await db.execute(`SELECT * FROM bookings WHERE id=?`, [id]);
    return rows[0];
  },

  checkConflict: async ({ instructorId, date, time }) => {
    const db = await connectToDatabase();
    const [rows] = await db.execute(
      `SELECT * FROM bookings WHERE instructor_id=? AND date=? AND time=?`,
      [instructorId, date, time]
    );
    return rows.length > 0;
  },
};

export default Booking;
