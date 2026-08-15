import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
// Pastikan baris di bawah ini menggunakan updateProfile, bukan updateCompanyProfile
router.put('/profile', authenticate, updateProfile); 

export default router;