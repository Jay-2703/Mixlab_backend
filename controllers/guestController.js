// ============================================
// FILE: controllers/guestController.js
// ============================================
import { connectToDatabase } from '../config/db.js';

export const getGuestProfile = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { guestId } = req;

    const [rows] = await db.query(
      'SELECT guest_id, ip_address, created_at, last_activity FROM guest_users WHERE guest_id = ?',
      [guestId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    res.json({ success: true, profile: rows[0] });
  } catch (error) {
    console.error('Error fetching guest profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const saveGameProgress = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { guestId } = req;
    const { gameId } = req.params;
    const { score, progress, completed } = req.body;

    if (score === undefined || progress === undefined) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const query = `
      INSERT INTO game_progress (guest_id, game_id, score, progress_data, played_at, completed)
      VALUES (?, ?, ?, ?, NOW(), ?)
      ON DUPLICATE KEY UPDATE 
        score = GREATEST(score, VALUES(score)),
        progress_data = VALUES(progress_data),
        played_at = NOW(),
        completed = IFNULL(VALUES(completed), completed)
    `;
    const [result] = await db.query(query, [
      guestId,
      gameId,
      score,
      JSON.stringify(progress),
      completed || false,
    ]);

    console.log(`✓ Guest ${guestId} progress saved - Game: ${gameId}, Score: ${score}`);

    res.json({
      success: true,
      message: 'Progress saved',
      result,
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
};

export const getGuestGameHistory = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { guestId } = req;

    const [rows] = await db.query(
      `SELECT g.id, g.name, g.description, gp.score, gp.progress_data, gp.played_at, gp.completed
       FROM games g
       LEFT JOIN game_progress gp ON g.id = gp.game_id
       WHERE gp.guest_id = ?
       ORDER BY gp.played_at DESC`,
      [guestId]
    );

    res.json({
      success: true,
      gameHistory: rows,
      totalGamesPlayed: rows.length,
    });
  } catch (error) {
    console.error('Error fetching game history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

// ============================================
// GUEST BOOKING FUNCTIONS
// ============================================

export const createGuestBooking = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { guestId } = req;
    const { booking_date, booking_time, hours = 1 } = req.body;

    // For studio rental booking (not lesson-based)
    if (!booking_date || !booking_time) {
      return res.status(400).json({ 
        error: 'Booking date and time are required',
        example: {
          booking_date: '2025-11-15',
          booking_time: '14:00',
          hours: 2
        }
      });
    }

    // Optional: Check booking conflicts (same date/time)
    const bookingDateTime = `${booking_date} ${booking_time}`;
    const [existing] = await db.query(
      'SELECT * FROM bookings WHERE booking_date = ? AND status NOT IN (?, ?)',
      [bookingDateTime, 'Cancelled', 'Completed']
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: 'Time slot already booked',
        message: 'This time slot is already booked. Please choose another date/time.',
      });
    }

    // Use the same bookings table (user_id can be NULL for guests)
    const qrData = `guest_booking:${guestId}-${booking_date}-${booking_time}`;
    
    const [result] = await db.query(
      `INSERT INTO bookings 
       (user_id, lesson_id, booking_date, status, qr_code, created_at) 
       VALUES (?, ?, ?, 'Pending', ?, NOW())`,
      [null, null, bookingDateTime, qrData]
    );

    const bookingId = result.insertId;

    res.json({
      success: true,
      message: 'Studio booking request created (temporary)',
      booking: {
        booking_id: bookingId,
        guest_id: guestId,
        booking_date,
        booking_time,
        hours,
        status: 'Pending',
        qr_code: qrData
      },
      note: 'This is a temporary guest booking. Sign up to make it permanent and receive notifications.'
    });
  } catch (error) {
    console.error('Guest booking error:', error);
    res.status(500).json({ error: 'Failed to create booking', message: error.message });
  }
};

export const getGuestBookings = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { guestId } = req;

    // Get all guest bookings (user_id IS NULL, qr_code matches guest pattern)
    const [rows] = await db.query(
      `SELECT booking_id, booking_date, status, qr_code, created_at
       FROM bookings
       WHERE user_id IS NULL AND qr_code LIKE ?
       ORDER BY booking_date DESC`,
      [`guest_booking:${guestId}-%`]
    );

    res.json({
      success: true,
      bookings: rows,
      totalBookings: rows.length
    });
  } catch (error) {
    console.error('Error fetching guest bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const cancelGuestBooking = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { guestId } = req;
    const { bookingId } = req.params;

    // Verify this is a guest booking
    const [rows] = await db.query(
      'SELECT * FROM bookings WHERE booking_id = ? AND user_id IS NULL AND qr_code LIKE ?',
      [bookingId, `guest_booking:${guestId}-%`]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await db.query(
      'UPDATE bookings SET status = ? WHERE booking_id = ?',
      ['Cancelled', bookingId]
    );

    res.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    console.error('Error cancelling guest booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};