import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/authRoutes.js';
import { authenticateToken } from './middleware/authMiddleware.js';
import cookieParser from 'cookie-parser';


import lessonRoutes from './routes/lessonRoutes.js';
import userRoutes from "./routes/userRoutes.js"
import badgeRoutes from "./routes/badgeRoutes.js";
import bookingRoutes from './routes/bookingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';



import guestTracking from './middleware/guestTracking.js';
import checkGuestAccess from './middleware/guestAccess.js';
import {
  getGuestProfile,
  saveGameProgress,
  getGuestGameHistory,
} from './controllers/guestController.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Test: 1 passed
app.get('/', (req, res) => {
  res.send(" API is running");
});

app.use('/auth', authRouter);
app.use('/lessons', lessonRoutes);

// Serve frontend files from "public" folder
app.use(express.static("public"));

// Protected route
app.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'This is protected', user: req.user });
});

// after app initialization
app.use("/auth", userRoutes);
app.use("/auth/lessons", lessonRoutes);
app.use("/auth/badges", badgeRoutes);
app.use('/auth', bookingRoutes);   
app.use('/auth', notificationRoutes);
app.use('/analytics', analyticsRoutes);


//guest


// ⚙️ Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// ============================================
// 🧭 ROUTES
// ============================================

// 👤 Guest Profile
app.get('/auth/guest/profile', guestTracking, getGuestProfile);

// 🕹️ Guest Game History
app.get('/auth/guest/history', guestTracking, getGuestGameHistory);

// 💾 Save Guest Game Progress
app.post('/auth/guest/progress/:gameId', guestTracking, saveGameProgress);

// 🎮 Play Game (guest access rules)
app.get(
  '/auth/games/play/:gameId',
  guestTracking,
  checkGuestAccess,
  (req, res) => {
    res.json({
      success: true,
      game: req.gameData,
      message: 'Access granted',
    });
  }
);

// 🧱 OPTIONAL: Auth (only if you have register/login)
// app.post('/api/auth/register', guestTracking, registerUser);
// app.post('/api/auth/login', guestTracking, loginUser);

// ============================================
// ⚠️ Error Handling Middleware
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message:
      process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ============================================
// 🚀 Start Server
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  🎮 Game Server Running
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📍 http://localhost:${PORT}
  🔧 Environment: ${process.env.NODE_ENV || 'development'}
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ MySQL Connected
  ✓ Guest Tracking: ENABLED
  ✓ Game Access Control: ENABLED
  `);
});





app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});





















/*import express from 'express';
import cors from 'cors'
import { connectToDatabase } from './config/db.js';
import authRouter from './routes/authRoutes.js';
import { authenticateToken } from './middleware/authMiddleware.js';



const app = express()
app.use(express.json())
app.use(cors());
app.use('/auth', authRouter)

// Protected route
app.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'This is protected', user: req.user });
});

app.get('/', (req, res)=> {
    res.send("api is running");
});

connectToDatabase()
  .then(() => {
    console.log("Database connection successful!");
    app.listen(process.env.PORT, () => {
      console.log("Server is running");
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });
*/