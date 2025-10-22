import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { 
  getRevenue, 
  getStudentEngagement, 
  getPopularSlots 
} from '../controllers/analyticsController.js';

const router = express.Router();

// Protect these routes for admin only
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/revenue', getRevenue);
router.get('/student-engagement', getStudentEngagement);
router.get('/popular-slots', getPopularSlots);

export default router;


