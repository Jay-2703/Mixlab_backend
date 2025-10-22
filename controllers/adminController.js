import { connectToDatabase } from '../config/db.js';

// GET /admin/users - view all users
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await connectToDatabase.query('SELECT id, name, email, role FROM users');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// PUT /admin/users/:id - update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    await connectToDatabase.query('UPDATE users SET name=?, email=?, role=? WHERE id=?', [
      name, email, role, id
    ]);

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

// DELETE /admin/users/:id - delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await connectToDatabase.query('DELETE FROM users WHERE id=?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// POST /admin/reports - generate analytics reports
export const generateReport = async (req, res) => {
  try {
    const [userCount] = await connectToDatabase.query('SELECT COUNT(*) AS total_users FROM users');
    const [lessonCount] = await connectToDatabase.query('SELECT COUNT(*) AS total_lessons FROM lessons');
    const [bookingCount] = await connectToDatabase.query('SELECT COUNT(*) AS total_bookings FROM bookings');

    const report = {
      total_users: userCount[0].total_users,
      total_lessons: lessonCount[0].total_lessons,
      total_bookings: bookingCount[0].total_bookings,
    };

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating report' });
  }
};


export const addInstructor = async (req, res) => {
  try {
    const { name, email, specialization } = req.body;
    await connectToDatabase.query(
      'INSERT INTO users (name, email, role, specialization) VALUES (?, ?, "instructor", ?)',
      [name, email, specialization]
    );
    res.json({ message: 'Instructor added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding instructor' });
  }
};




