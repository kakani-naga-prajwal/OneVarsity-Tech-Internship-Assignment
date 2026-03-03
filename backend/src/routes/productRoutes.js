import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listProductsValidators,
  createProductValidators,
  updateProductValidators,
} from '../controllers/productController.js';
import { validate } from '../middleware/validate.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', validate(listProductsValidators), listProducts);
router.get('/:id', getProduct);

router.post('/', authenticate, requireAdmin, validate(createProductValidators), createProduct);
router.put('/:id', authenticate, requireAdmin, validate(updateProductValidators), updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

export default router;
