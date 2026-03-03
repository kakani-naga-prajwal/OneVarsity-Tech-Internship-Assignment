import { Router } from 'express';
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  simulatePayment,
} from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', placeOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.post('/:id/pay', simulatePayment);
router.post('/:id/pay-card/generate-otp', async (req, res, next) => {
  try {
    const { id } = req.params;
    // Real implementation would send SMS via Twilio/etc
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    console.log(`[GENERATED OTP] For order ${id}: ${otp}`);
    return res.json({ success: true, message: 'OTP sent successfully to registered mobile number', otp }); // returning OTP for UI simulation
  } catch (err) {
    next(err);
  }
});

router.post('/:id/pay-card/verify-otp', async (req, res, next) => {
  try {
    const { otpSent, otpEntered } = req.body;
    if (otpSent !== otpEntered) {
      return res.status(400).json({ success: false, message: 'Invalid OTP entered' });
    }
    const order = await import('../models/index.js').then(m => m.Order.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    }));
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.payment_status === 'paid') return res.json({ success: true, message: 'Already paid.', data: order });
    await order.update({ payment_status: 'paid' });
    res.json({ success: true, message: 'Card Payment successful.', data: order });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/pay-upi', async (req, res, next) => {
  try {
    const { utr } = req.body;
    if (!utr || utr.length < 12) {
      return res.status(400).json({ success: false, message: 'Invalid UTR Number provided. Minimum 12 characters required.' });
    }
    const order = await import('../models/index.js').then(m => m.Order.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    }));
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.payment_status === 'paid') return res.json({ success: true, message: 'Already paid.', data: order });
    await order.update({ payment_status: 'paid' });
    res.json({ success: true, message: 'UPI Payment successful.', data: order });
  } catch (err) {
    next(err);
  }
});

export default router;
