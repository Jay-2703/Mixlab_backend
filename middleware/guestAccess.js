// ============================================
// FILE: middleware/guestAccess.js
// ============================================
import { connectToDatabase } from '../config/db.js';

const checkGuestAccess = async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const { guestId } = req;
    const { gameId } = req.params;

    const [guestRows] = await db.query(
      'SELECT * FROM guest_users WHERE guest_id = ?',
      [guestId]
    );

    if (guestRows.length === 0) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    const [gameRows] = await db.query(
      'SELECT * FROM games WHERE id = ?',
      [gameId]
    );

    if (gameRows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const game = gameRows[0];

    if (game.premium_only === 1) {
      return res.status(403).json({
        error: 'Premium game',
        message: 'This is a premium game. Sign up or upgrade to access it.',
      });
    }

    if (game.difficulty_level > 2) {
      return res.status(403).json({
        error: 'Level locked',
        message: `This game is level ${game.difficulty_level}. Guests can only access levels 1–2.`,
      });
    }

    req.isGuest = true;
    req.guestData = guestRows[0];
    req.gameData = game;

    console.log(`✓ Guest ${guestId} allowed to play: ${game.name}`);
    next();
  } catch (error) {
    console.error('Access check error:', error);
    res.status(500).json({ error: 'Access check failed' });
  }
};

export default checkGuestAccess;
