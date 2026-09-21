import express from 'express';
import { changePassword, getUsers, loginUser, registerUser, updateProfile } from '../controllers/authController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.use(protect);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.get('/users', adminOnly, getUsers);

export default router;
