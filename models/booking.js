// models/booking.js
import { connectToDatabase } from '../config/db.js';

const Booking = {
  create: async ({ studentId, instructorId, lessonType, date, startTime, endTime, notes, qrCode }) => {
    try {
      console.log(' [create] Creating booking:', { studentId, instructorId, lessonType, date });
      const db = await connectToDatabase();
      
      const [result] = await db.execute(
        `INSERT INTO bookings (\`student_id\`, \`instructor_id\`, \`lesson_type\`, \`booking_date\`, \`start_time\`, \`end_time\`, \`status\`, \`notes\`, \`qr_code\`, \`created_at\`) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          studentId || null,
          instructorId || null,
          lessonType || 'Recording Studio',
          date || null,
          startTime || null,
          endTime || null,
          'pending',
          notes || null,
          qrCode || null
        ]
      );
      console.log(' [create] Booking created with ID:', result.insertId);
      return result;
    } catch (error) {
      console.error(' [create] Error:', error.message);
      throw error;
    }
  },

  update: async (id, { date, startTime, endTime, status }) => {
    try {
      console.log(' [update] Updating booking:', id);
      const db = await connectToDatabase();
      
      let query = 'UPDATE bookings SET ';
      const params = [];
      
      if (date) {
        query += '`booking_date` = ?, ';
        params.push(date);
      }
      if (startTime) {
        query += '`start_time` = ?, ';
        params.push(startTime);
      }
      if (endTime) {
        query += '`end_time` = ?, ';
        params.push(endTime);
      }
      if (status) {
        query += '`status` = ?, ';
        params.push(status);
      }
      
      query += '`updated_at` = NOW() WHERE `booking_id` = ?';
      params.push(id);
      
      const [result] = await db.execute(query, params);
      console.log(' [update] Updated');
      return result;
    } catch (error) {
      console.error(' [update] Error:', error.message);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      console.log(' [delete] Deleting booking:', id);
      const db = await connectToDatabase();
      const [result] = await db.execute(`DELETE FROM bookings WHERE \`booking_id\`=?`, [id]);
      console.log(' [delete] Deleted');
      return result;
    } catch (error) {
      console.error(' [delete] Error:', error.message);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      console.log(' [getById] Fetching booking:', id);
      const db = await connectToDatabase();
      const [rows] = await db.execute(`SELECT * FROM bookings WHERE \`booking_id\`=?`, [id]);
      console.log(' [getById] Found:', rows[0] ? 'yes' : 'no');
      return rows[0];
    } catch (error) {
      console.error(' [getById] Error:', error.message);
      throw error;
    }
  },

  getByUserId: async (userId) => {
    try {
      console.log(' [getByUserId] Fetching bookings for user:', userId);
      const db = await connectToDatabase();
      const [rows] = await db.execute(
        `SELECT * FROM bookings WHERE \`student_id\`=? OR \`instructor_id\`=? ORDER BY \`booking_date\` DESC`,
        [userId, userId]
      );
      console.log(' [getByUserId] Found:', rows.length, 'bookings');
      return rows;
    } catch (error) {
      console.error(' [getByUserId] Error:', error.message);
      throw error;
    }
  },

  checkConflict: async ({ userId, date, time }) => {
    try {
      console.log(' [checkConflict] Checking conflict for date:', date);
      const db = await connectToDatabase();
      
      if (!date) {
        console.warn('⚠️ [checkConflict] No date provided');
        return false;
      }
      
      const [rows] = await db.execute(
        `SELECT * FROM bookings WHERE \`booking_date\`=? AND \`status\` NOT IN ('cancelled', 'Cancelled')`,
        [date]
      );
      
      const hasConflict = rows.length > 0;
      console.log('✅ [checkConflict] Conflict found:', hasConflict);
      return hasConflict;
    } catch (error) {
      console.error(' [checkConflict] Error:', error.message);
      throw error;
    }
  },
 
  getByQRCode: async (qrCode) => {
    try {
      console.log(' [getByQRCode] Fetching by QR:', qrCode);
      const db = await connectToDatabase();
      const [rows] = await db.execute(
        `SELECT * FROM bookings WHERE \`qr_code\`=? LIMIT 1`,
        [qrCode]
      );
      console.log('✅ [getByQRCode] Found:', rows[0] ? 'yes' : 'no');
      return rows[0];
    } catch (error) {
      console.error(' [getByQRCode] Error:', error.message);
      throw error;
    }
  },

  markCheckedIn: async (bookingId) => {
    try {
      console.log(' [markCheckedIn] Marking checked in:', bookingId);
      const db = await connectToDatabase();
      const [result] = await db.execute(
        `UPDATE bookings SET \`status\`='confirmed', \`check_in_time\`=NOW() WHERE \`booking_id\`=?`,
        [bookingId]
      );
      console.log(' [markCheckedIn] Marked');
      return result;
    } catch (error) {
      console.error(' [markCheckedIn] Error:', error.message);
      throw error;
    }
  }
};

export default Booking;