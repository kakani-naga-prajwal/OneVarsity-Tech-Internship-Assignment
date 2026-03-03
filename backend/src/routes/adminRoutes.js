import { Router } from 'express';
import { Sequelize } from 'sequelize';
import { User, Order, OrderItem, Product, Category } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'created_at'],
    });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

router.get('/orders', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : {};
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const { rows, count } = await Order.findAndCountAll({
      where,
      include: [{ model: OrderItem, as: 'OrderItems', include: [{ model: Product, as: 'Product', attributes: ['id', 'name'] }] }],
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset,
    });
    res.json({
      success: true,
      data: rows,
      pagination: { page: parseInt(page, 10), limit: limitNum, total: count, totalPages: Math.ceil(count / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/analytics', async (req, res, next) => {
  try {
    const totalOrders = await Order.count();
    const totalRevenue = await Order.sum('total_amount', { where: { payment_status: 'paid' } });
    const byStatus = await Order.findAll({
      attributes: ['status', [Order.sequelize.fn('COUNT', '*'), 'count']],
      group: ['status'],
      raw: true,
    });

    // Calculate sales by Category by joining OrderItems and Products
    const byCategory = await OrderItem.findAll({
      attributes: [
        [Sequelize.col('Product.Category.name'), 'category'],
        [Sequelize.fn('SUM', Sequelize.col('OrderItem.quantity')), 'quantitySold'],
        [Sequelize.fn('SUM', Sequelize.literal('"OrderItem"."quantity" * "OrderItem"."price"')), 'revenue']
      ],
      include: [{
        model: Product,
        as: 'Product',
        attributes: [],
        include: [{
          model: Category,
          as: 'Category',
          attributes: [],
        }]
      }],
      group: ['Product.Category.id', 'Product.Category.name'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue || 0,
        byStatus,
        byCategory: byCategory.map(c => ({
          category: c.category || 'Uncategorized',
          revenue: parseFloat(c.revenue || 0),
          quantity: parseInt(c.quantitySold || 0, 10)
        }))
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/analytics/monthly', async (req, res, next) => {
  try {
    const monthly = await Order.findAll({
      attributes: [
        [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('created_at')), 'month'],
        [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'sales'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'orders'],
      ],
      where: { payment_status: 'paid' },
      group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('created_at'))],
      order: [[Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('created_at')), 'ASC']],
      raw: true,
    });
    const data = monthly.map((m) => ({
      month: m.month ? new Date(m.month).toLocaleString('default', { month: 'short', year: 'numeric' }) : 'N/A',
      sales: parseFloat(m.sales || 0),
      orders: parseInt(m.orders || 0, 10),
    }));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
