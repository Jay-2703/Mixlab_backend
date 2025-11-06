import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// 📥 IMPORTS - Routes
import authRouter from './routes/authRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import quizAttemptRoutes from './routes/quizAttemptRoutes.js';
import xpRoutes from './routes/xpRoutes.js';
import modulesRoutes from './routes/modulesRoutes.js';
import userRoutes from './routes/userRoutes.js';
import badgeRoutes from './routes/badgeRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// 📥 IMPORTS - Middleware
import { authenticateToken } from './middleware/authMiddleware.js';
import guestTracking from './middleware/guestTracking.js';
import checkGuestAccess from './middleware/guestAccess.js';

// 📥 IMPORTS - Controllers
import {
  getGuestProfile,
  saveGameProgress,
  getGuestGameHistory,
  createGuestBooking,
  getGuestBookings,
  cancelGuestBooking,
} from './controllers/guestController.js';

dotenv.config();

const app = express();

// ⚙️ GLOBAL MIDDLEWARES
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Serve frontend files from "public" folder
app.use(express.static('public'));

// BASE ROUTES
app.get('/', (req, res) => {
  res.send('🎮 Game API is running');
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Base API prefix
const API_BASE = '/api';

// AUTH ROUTES
app.use(`${API_BASE}/auth`, authRouter);

//  LESSON ROUTES
app.use(`${API_BASE}/lessons`, lessonRoutes);

//  QUIZ ROUTES
app.use(`${API_BASE}/quizzes`, quizRoutes);
app.use(`${API_BASE}/quiz-attempts`, quizAttemptRoutes);

//  XP & BADGES ROUTES
app.use(`${API_BASE}/users`, xpRoutes);
app.use(`${API_BASE}/badges`, badgeRoutes);

// MODULES ROUTES
app.use(`${API_BASE}/modules`, modulesRoutes);

// USER ROUTES
app.use(`${API_BASE}/users`, userRoutes);

// BOOKING ROUTES
app.use(`${API_BASE}/bookings`, bookingRoutes);

// NOTIFICATION ROUTES
app.use(`${API_BASE}/notifications`, notificationRoutes);

// ANALYTICS ROUTES
app.use(`${API_BASE}/analytics`, analyticsRoutes);

// ADMIN ROUTES NEW
app.use(`${API_BASE}/admin`, adminRoutes);

// PROTECTED USER ROUTE
app.get(`${API_BASE}/profile`, authenticateToken, (req, res) => {
  res.json({ message: 'This is protected', user: req.user });
});

// GUEST ROUTES (No Auth Required)

// Guest Profile
app.get(`${API_BASE}/guest/profile`, guestTracking, getGuestProfile);

// Guest Game History
app.get(`${API_BASE}/guest/history`, guestTracking, getGuestGameHistory);

// Save Guest Game Progress
app.post(`${API_BASE}/guest/progress/:gameId`, guestTracking, saveGameProgress);

// Play Game (guest access rules)
app.get(
  `${API_BASE}/lessons/play/:lessonId`,
  guestTracking,
  checkGuestAccess,
  (req, res) => {
    res.json({
      success: true,
      lesson: req.lessonData,
      message: 'Access granted',
    });
  }
);

// Guest Bookings
app.post(`${API_BASE}/guest/bookings`, guestTracking, createGuestBooking);
app.get(`${API_BASE}/guest/bookings`, guestTracking, getGuestBookings);
app.delete(`${API_BASE}/guest/bookings/:bookingId`, guestTracking, cancelGuestBooking);

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  console.error(' Error:', err.stack);
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

//  START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`

Server: http://localhost:${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
API Base: http://localhost:${PORT}/api

Middleware: CORS, Auth, Guest Tracking
Database: MySQL Connected

  `);
});