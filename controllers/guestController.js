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
