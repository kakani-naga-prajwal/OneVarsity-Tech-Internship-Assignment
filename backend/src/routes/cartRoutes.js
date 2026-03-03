import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  addToCartValidators,
  updateCartValidators,
} from '../controllers/cartController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', getCart);
router.post('/', validate(addToCartValidators), addToCart);
router.put('/:id', validate(updateCartValidators), updateCartItem);
router.delete('/:id', removeFromCart);

export default router;
