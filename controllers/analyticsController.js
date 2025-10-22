import { connectToDatabase } from '../config/db.js';

// GET /analytics/revenue
export const getRevenue = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') AS month,
        SUM(price) AS total_revenue
      FROM bookings
      WHERE status = 'completed'
      GROUP BY month
      ORDER BY month DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching revenue data' });
  }
};

// GET /analytics/student-engagement
export const getStudentEngagement = async (req, res) => {
  try {
    const [activeStudents] = await db.query(`
      SELECT COUNT(DISTINCT student_id) AS active_students
      FROM bookings
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);

    const [repeatStudents] = await db.query(`
      SELECT COUNT(*) AS repeat_students FROM (
        SELECT student_id FROM bookings
        GROUP BY student_id
        HAVING COUNT(*) > 1
      ) AS sub
    `);

    const [totalStudents] = await db.query(`
      SELECT COUNT(*) AS total_students FROM users WHERE role='student'
    `);

    res.json({
      active_students: activeStudents[0].active_students,
      repeat_students: repeatStudents[0].repeat_students,
      total_students: totalStudents[0].total_students,
      retention_rate: (
        (repeatStudents[0].repeat_students / totalStudents[0].total_students) * 100
      ).toFixed(2) + '%'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching engagement data' });
  }
};

// GET /analytics/popular-slots
export const getPopularSlots = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT time, COUNT(*) AS bookings_count
      FROM bookings
      GROUP BY time
      ORDER BY bookings_count DESC
      LIMIT 5
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching popular slots' });
  }
};


