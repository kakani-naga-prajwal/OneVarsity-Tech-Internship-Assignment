import { Router } from 'express';
import { body } from 'express-validator';
import { Category } from '../models/index.js';
import { validate } from '../middleware/validate.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, requireAdmin, validate([
  body('name').trim().notEmpty().isLength({ max: 255 }),
]), async (req, res, next) => {
  try {
    const category = await Category.create({ name: req.body.name });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
});

export default router;
