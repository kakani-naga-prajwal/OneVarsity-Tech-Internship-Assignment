import { body, param, query } from 'express-validator';
import { Op } from 'sequelize';
import { Category, Product, CartItem, OrderItem } from '../models/index.js';
import { validate } from '../middleware/validate.js';

export const createProductValidators = [
  body('name').trim().notEmpty().isLength({ max: 255 }),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }).toInt(),
  body('image_url').optional().trim().isURL().withMessage('Must be a valid URL'),
  body('category_id').optional().isUUID(),
];

export async function createProduct(req, res, next) {
  try {
    const product = await Product.create({
      ...req.body,
      stock: req.body.stock ?? 0,
    });
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export const updateProductValidators = [
  param('id').isUUID(),
  body('name').optional().trim().notEmpty().isLength({ max: 255 }),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }).toInt(),
  body('image_url').optional().trim().isURL(),
  body('category_id').optional().isUUID(),
];

export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    await product.update(req.body);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    // remove any dependant cart or order items before destroying to avoid FK errors
    await CartItem.destroy({ where: { product_id: product.id } });
    await OrderItem.destroy({ where: { product_id: product.id } });
    await product.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export const listProductsValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().trim(),
  query('category').optional().isUUID(),
  query('sort').optional().isIn(['name', 'price', 'created_at']),
  query('order').optional().isIn(['ASC', 'DESC']),
];

export async function listProducts(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const offset = (page - 1) * limit;
    const { search, category, sort = 'created_at', order = 'DESC' } = req.query;
    const where = {};
    if (search) {
      const pattern = `%${search}%`;
      const nameCond = {};
      nameCond[Op.iLike] = pattern;
      const descCond = {};
      descCond[Op.iLike] = pattern;
      where[Op.or] = [
        { name: nameCond },
        { description: descCond },
      ];
    }
    if (category) where.category_id = category;
    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, as: 'Category', attributes: ['id', 'name'] }],
      limit,
      offset,
      order: [[sort, order]],
    });
    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'Category', attributes: ['id', 'name'] }],
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}
