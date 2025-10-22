import {connectToDatabase} from '../config/db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const continueAsGuest = async (req, res) => {
  try {
    await connectToDatabase.query('INSERT INTO guests (role) VALUES (?)', ['guest']);
    res.status(201).json({ message: 'Guest session started' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};
