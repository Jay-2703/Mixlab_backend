import { connectToDatabase } from '../config/db.js';
import crypto from 'crypto';

const guestTracking = async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    let guestId = req.cookies.guest_id;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    if (!guestId) {
      guestId = generateGuestId();

      res.cookie('guest_id', guestId, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      await createGuestRecord(db, guestId, ipAddress, userAgent);
      console.log(`✓ New guest created: ${guestId} from IP: ${ipAddress}`);
    } else {
      await updateGuestActivity(db, guestId);
    }

    req.guestId = guestId;
    req.ipAddress = ipAddress;
    req.userAgent = userAgent;

    next();
  } catch (error) {
    console.error('Guest tracking error:', error);
    res.status(500).json({ error: 'Tracking failed' });
  }
};

const generateGuestId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = crypto.randomBytes(8).toString('hex');
  return `guest_${timestamp}_${randomStr}`;
};

const createGuestRecord = async (db, guestId, ipAddress, userAgent) => {
  const query = `
    INSERT INTO guest_users (guest_id, ip_address, user_agent, created_at, last_activity)
    VALUES (?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE last_activity = NOW()
  `;
  await db.query(query, [guestId, ipAddress, userAgent]);
};

const updateGuestActivity = async (db, guestId) => {
  const query = `
    UPDATE guest_users 
    SET last_activity = NOW() 
    WHERE guest_id = ?
  `;
  await db.query(query, [guestId]);
};

export default guestTracking;
