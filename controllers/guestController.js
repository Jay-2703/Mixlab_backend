import db from '../config/db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const continueAsGuest = async (req, res) => {
  const name = req.body.name || 'Guest';
  // create guest with temporary email pattern or null email
  const [result] = await db.query('INSERT INTO users (name, role) VALUES (?, ?)', [name, 'guest']);
  const id = result.insertId;
  const token = jwt.sign({ id, role: 'guest' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
  res.json({ token, user: { id, name, role: 'guest' }});
};
