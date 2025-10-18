// routes/lessonRoutes.js
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/authorize.js';
const router = express.Router();

// public free lesson
router.get('/free', (req, res) => res.send('Free lesson for everyone'));

// guest-only or any - if you want to allow guests with role 'guest' saved in DB:
router.get('/guest-preview', authenticateToken, authorizeRoles('guest','user','admin'), (req, res) => {
  res.send('Preview for guest and registered users');
});

// premium lesson - only registered users and admins
router.get('/premium', authenticateToken, authorizeRoles('user','admin'), (req, res) => {
  res.send('Premium lesson only for logged-in users');
});

// admin route
router.delete('/lesson/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.send('Lesson deleted');
});

export default router;
