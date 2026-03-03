import { v4 as uuidv4 } from 'uuid';
import { CartItem, Order, OrderItem, Product } from '../models/index.js';

function generateOrderNumber() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${t}-${r}`;
}

export async function placeOrder(req, res, next) {
  try {
    const userId = req.user.id;
    const cartItems = await CartItem.findAll({
      where: { user_id: userId },
      include: [{ model: Product, as: 'Product' }],
    });
    if (!cartItems.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }
    let total = 0;
    const orderItemsData = [];
    for (const ci of cartItems) {
      const product = ci.Product;
      if (product.stock < ci.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}.`,
        });
      }
      const price = Number(product.price);
      total += price * ci.quantity;
      orderItemsData.push({
        product_id: product.id,
        quantity: ci.quantity,
        price,
      });
    }
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      user_id: userId,
      order_number: orderNumber,
      total_amount: total.toFixed(2),
      status: 'pending',
      payment_status: 'pending',
    });
    for (const oi of orderItemsData) {
      await OrderItem.create({
        order_id: order.id,
        product_id: oi.product_id,
        quantity: oi.quantity,
        price: oi.price,
      });
    }
    for (const ci of cartItems) {
      const product = await Product.findByPk(ci.product_id);
      await product.decrement('stock', { by: ci.quantity });
    }
    await CartItem.destroy({ where: { user_id: userId } });
    const fullOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'OrderItems', include: [{ model: Product, as: 'Product' }] }],
    });
    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: fullOrder,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [{ model: OrderItem, as: 'OrderItems', include: [{ model: Product, as: 'Product', attributes: ['id', 'name', 'image_url'] }] }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: OrderItem, as: 'OrderItems', include: [{ model: Product, as: 'Product' }] }],
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}

export async function simulatePayment(req, res, next) {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.payment_status === 'paid') {
      return res.json({ success: true, message: 'Already paid.', data: order });
    }
    await order.update({ payment_status: 'paid' });
    res.json({ success: true, message: 'Payment simulated successfully.', data: order });
  } catch (err) {
    next(err);
  }
}
