import { body, param } from 'express-validator';
import { CartItem, Product } from '../models/index.js';
import { validate } from '../middleware/validate.js';

export const addToCartValidators = [
  body('product_id').isUUID(),
  body('quantity').optional().isInt({ min: 1 }).toInt().default(1),
];

export async function addToCart(req, res, next) {
  try {
    const { product_id, quantity = 1 } = req.body;
    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock.' });
    }
    const [item, created] = await CartItem.findOrCreate({
      where: { user_id: req.user.id, product_id },
      defaults: { quantity },
    });
    if (!created) {
      const newQty = item.quantity + quantity;
      if (product.stock < newQty) {
        return res.status(400).json({ success: false, message: 'Insufficient stock.' });
      }
      await item.update({ quantity: newQty });
    }
    const cart = await CartItem.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Product, as: 'Product', attributes: ['id', 'name', 'price', 'stock', 'image_url'] }],
    });
    res.status(201).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
}

export const updateCartValidators = [
  param('id').isUUID(),
  body('quantity').isInt({ min: 0 }).toInt(),
];

export async function updateCartItem(req, res, next) {
  try {
    const item = await CartItem.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: Product, as: 'Product' }],
    });
    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found.' });
    if (req.body.quantity === 0) {
      await item.destroy();
      const cart = await CartItem.findAll({
        where: { user_id: req.user.id },
        include: [{ model: Product, as: 'Product', attributes: ['id', 'name', 'price', 'stock', 'image_url'] }],
      });
      return res.json({ success: true, data: cart });
    }
    if (item.Product.stock < req.body.quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock.' });
    }
    await item.update({ quantity: req.body.quantity });
    const cart = await CartItem.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Product, as: 'Product', attributes: ['id', 'name', 'price', 'stock', 'image_url'] }],
    });
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
}

export async function removeFromCart(req, res, next) {
  try {
    const deleted = await CartItem.destroy({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!deleted) return res.status(404).json({ success: false, message: 'Cart item not found.' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getCart(req, res) {
  const cart = await CartItem.findAll({
    where: { user_id: req.user.id },
    include: [{ model: Product, as: 'Product', attributes: ['id', 'name', 'price', 'stock', 'image_url'] }],
  });
  res.json({ success: true, data: cart });
}
