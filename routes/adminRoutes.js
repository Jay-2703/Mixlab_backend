import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { 
  getAllUsers, 
  updateUser, 
  deleteUser, 
  generateReport 
} from '../controllers/adminController.js';

const router = express.Router();

// Only admins can access these routes
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// User management
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Reports
router.post('/reports', generateReport);

export default router;
