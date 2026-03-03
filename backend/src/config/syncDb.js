import sequelize from './database.js';
import '../models/index.js';

async function sync() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: process.env.DB_ALTER === 'true' });
    console.log('Database synced successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Sync failed:', err.message);
    process.exit(1);
  }
}

sync();
