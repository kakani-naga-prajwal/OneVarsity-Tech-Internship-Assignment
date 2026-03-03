import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING(500),
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'categories', key: 'id' },
    onDelete: 'SET NULL',
  },
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    { fields: ['category_id'] },
    { fields: ['name'] },
    { fields: ['price'] },
  ],
});

export default Product;
