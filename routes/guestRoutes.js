import guestTracking from '../middleware/guestTracking.js';
import { 
  getGuestProfile, 
  saveGameProgress, 
  getGuestGameHistory 
} from '../controllers/guestController.js';

const router = express.Router();

router.get('/profile', guestTracking, getGuestProfile);
router.get('/history', guestTracking, getGuestGameHistory);
router.post('/progress/:gameId', guestTracking, saveGameProgress);

