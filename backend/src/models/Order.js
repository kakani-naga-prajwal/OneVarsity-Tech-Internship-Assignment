import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  order_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'RESTRICT',
  },
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(...ORDER_STATUSES),
    defaultValue: 'pending',
  },
  payment_status: {
    type: DataTypes.ENUM(...PAYMENT_STATUSES),
    defaultValue: 'pending',
  },
}, {
  tableName: 'orders',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['order_number'], unique: true },
    { fields: ['created_at'] },
  ],
});

Order.ORDER_STATUSES = ORDER_STATUSES;
Order.PAYMENT_STATUSES = PAYMENT_STATUSES;
export default Order;
