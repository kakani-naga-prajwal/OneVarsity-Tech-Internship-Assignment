import { Router } from 'express';
import {
  register,
  login,
  getMe,
  registerValidators,
  loginValidators,
} from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', validate(registerValidators), register);
router.post('/login', validate(loginValidators), login);
router.get('/me', authenticate, getMe);

export default router;
