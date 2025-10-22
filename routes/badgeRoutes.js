// routes/badgeRoutes.js
import express from "express";
import { getAllBadges, getUserBadges, createBadge } from "../controllers/badgeController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: view all available badges
router.get("/", getAllBadges);

// Private: get badges earned by logged-in user
router.get("/my", authenticateToken, getUserBadges);

// Admin: add new badge
router.post("/", createBadge);

export default router;
