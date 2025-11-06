
import { connectToDatabase } from '../config/db.js';

const checkGuestAccess = async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const { guestId } = req;
    let { lessonId } = req.params;

    // normalize and validate gameId (handle values like ':3')
    if (typeof lessonId === 'string') {
      lessonId = lessonId.replace(/^:+/, '');
    }
    const lessonIdNum = Number(lessonId);
    if (!Number.isInteger(lessonIdNum) || lessonIdNum <= 0) {
      return res.status(400).json({ error: 'Invalid lesson id' });
    }

    const [guestRows] = await db.query(
      'SELECT * FROM guest_users WHERE guest_id = ?',
      [guestId]
    );

    if (guestRows.length === 0) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    let lessonRows = [];
    try {
      const [rowsById] = await db.query(
        'SELECT * FROM lessons WHERE id = ?',
        [lessonIdNum]
      );
      lessonRows = rowsById;
    } catch (e) {
      // Unknown column 'id' → retry with lesson_id
      if (e && e.code === 'ER_BAD_FIELD_ERROR') {
        const [rowsByAlt] = await db.query(
          'SELECT * FROM lessons WHERE lesson_id = ?',
          [lessonIdNum]
        );
        lessonRows = rowsByAlt;
      } else {
        throw e;
      }
    }

    // Also fallback if no rows returned but no error (schema uses lesson_id with no data by id)
    if (lessonRows.length === 0) {
      const [rowsByAltNoErr] = await db.query(
        'SELECT * FROM lessons WHERE lesson_id = ?',
        [lessonIdNum]
      );
      lessonRows = rowsByAltNoErr;
    }

    if (lessonRows.length === 0) {
      return res.status(404).json({ 
        error: 'Lesson not found',
        hint: `No lesson with id ${lessonIdNum}. Check your DB for existing lesson_id values.`
      });
    }
    const lesson = lessonRows[0];

    // Guest limitations (non-payment based)
    const instrument = lesson.instrument?.toLowerCase();
    const duration = Number(lesson.duration) || 0;
    const availableSlots = Number(lesson.available_slots);

    // Limited instruments (only Piano and Guitar)
    if (instrument && !['piano', 'guitar'].includes(instrument)) {
      return res.status(403).json({
        error: 'Unavailable instrument',
        message: `Guest access is limited to Piano and Guitar lessons. This lesson is for ${lesson.instrument}. Sign up to access all instruments.`,
      });
    }

    // Keep guest lessons short/simple (<= 60 minutes)
    if (duration > 60) {
      return res.status(403).json({
        error: 'Lesson too advanced',
        message: 'Guests can only access lessons up to 60 minutes.',
      });
    }

    //Only show lessons that currently have available slots (if column is used)
    if (!Number.isNaN(availableSlots) && availableSlots <= 0) {
      return res.status(403).json({
        error: 'No availability',
        message: 'This lesson has no available slots for guests right now.',
      });
    }

    // OPTIONAL: If you add difficulty/premium columns later
    const premiumOnly = Object.prototype.hasOwnProperty.call(lesson, 'premium_only') ? Number(lesson.premium_only) : 0;
    const difficulty = Object.prototype.hasOwnProperty.call(lesson, 'difficulty_level') ? Number(lesson.difficulty_level) : 1;

    if (premiumOnly === 1) {
      return res.status(403).json({
        error: 'Premium lesson',
        message: 'This is a premium lesson. Sign up or upgrade to access it.',
      });
    }

    if (difficulty > 2) {
      return res.status(403).json({
        error: 'Level locked',
        message: `This lesson is level ${difficulty}. Guests can only access levels 1–2.`,
      });
    }

  
    // Play count limiting: max 3 total plays per guest
  
    
    const [countRows] = await db.query(
      'SELECT COUNT(*) AS total FROM guest_access_log WHERE guest_id = ?',
      [guestId]
    );
    const totalPlays = Number(countRows?.[0]?.total || 0);
    const MAX_PLAYS = 2;
    if (totalPlays >= MAX_PLAYS) {
      return res.status(403).json({
        error: 'Limit reached',
        message: `Guests can play up to ${MAX_PLAYS} sessions. Sign up to continue learning.`,
      });
    }

    // Record this access as a play session
    await db.query(
      'INSERT INTO guest_access_log (guest_id, lesson_id) VALUES (?, ?)',
      [guestId, lessonIdNum]
    );

    req.isGuest = true;
    req.guestData = guestRows[0];
    req.lessonData = lesson;

    const lessonDisplay = lesson.title || lesson.description?.substring(0, 30) || ('Lesson ' + lessonIdNum);
    console.log(`✓ Guest ${guestId} allowed to access: ${lessonDisplay}`);
    next();
  } catch (error) {
    console.error('Access check error:', error?.stack || error);
    res.status(500).json({ 
      error: 'Access check failed',
      message: process.env.NODE_ENV === 'development' ? (error?.message || String(error)) : undefined
    });
  }
};

export default checkGuestAccess;
