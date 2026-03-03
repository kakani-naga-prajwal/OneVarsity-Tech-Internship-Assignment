import sequelize from './database.js';
import { User, Category, Product } from '../models/index.js';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database. Starting seed...');

    // Create categories
    const electronicsCategory = await Category.findOrCreate({
      where: { name: 'Electronics' },
      defaults: { name: 'Electronics' },
    });

    const fashionCategory = await Category.findOrCreate({
      where: { name: 'Fashion' },
      defaults: { name: 'Fashion' },
    });

    const homeCategory = await Category.findOrCreate({
      where: { name: 'Home & Living' },
      defaults: { name: 'Home & Living' },
    });

    const beautyCategory = await Category.findOrCreate({
      where: { name: 'Beauty' },
      defaults: { name: 'Beauty' },
    });

    console.log('Categories created/fetched');

    // Create sample products for each category
    const electronicsProducts = [
      {
        name: 'Wireless Noise-Canceling Headphones',
        description: 'Premium noise-canceling headphones with 30-hour battery life',
        price: 3999.00,
        stock: 15,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        category_id: electronicsCategory[0].id,
      },
      {
        name: 'USB-C Fast Charging Cable',
        description: 'Durable 2-meter USB-C cable with 3A fast charging',
        price: 599.00,
        stock: 50,
        image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
        category_id: electronicsCategory[0].id,
      },
      {
        name: '4K Webcam',
        description: 'Crystal clear 4K resolution webcam for streaming and video calls',
        price: 4999.00,
        stock: 10,
        image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
        category_id: electronicsCategory[0].id,
      },
    ];

    const fashionProducts = [
      {
        name: 'Nike Running Shoes',
        description: 'Lightweight Nike running shoes with breathable mesh and responsive cushioning',
        price: 4499.00,
        stock: 20,
        image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
        category_id: fashionCategory[0].id,
      },
      {
        name: 'Minimalist Analog Watch',
        description: 'Elegant minimalist watch with leather strap',
        price: 2999.00,
        stock: 20,
        image_url: 'https://images.unsplash.com/photo-1523805861099-1aa6c4b146b5?auto=format&fit=crop&w=600&q=80',
        category_id: fashionCategory[0].id,
      },
      {
        name: 'Premium Leather Belt',
        description: 'Handcrafted genuine leather belt with brass buckle',
        price: 1999.00,
        stock: 30,
        image_url: 'https://images.unsplash.com/photo-1570222094114-d054a0be6070?auto=format&fit=crop&w=600&q=80',
        category_id: fashionCategory[0].id,
      },
    ];

    const homeProducts = [
      {
        name: 'Ergonomic Desk Chair',
        description: 'Comfortable office chair with lumbar support',
        price: 8999.00,
        stock: 12,
        image_url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=600&q=80',
        category_id: homeCategory[0].id,
      },
      {
        name: 'LED Smart Bulb',
        description: 'Dimmable LED bulb with 16 million color options',
        price: 799.00,
        stock: 45,
        image_url: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80',
        category_id: homeCategory[0].id,
      },
      {
        name: 'Decorative Wall Clock',
        description: 'Modern minimalist wall clock for any room',
        price: 1299.00,
        stock: 18,
        image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=600&q=80',
        category_id: homeCategory[0].id,
      },
    ];

    const beautyProducts = [
      {
        name: 'Organic Face Moisturizer',
        description: 'Natural moisturizer with SPF 30 protection',
        price: 1499.00,
        stock: 35,
        image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80',
        category_id: beautyCategory[0].id,
      },
      {
        name: 'Premium Makeup Brush Set',
        description: 'Professional 12-piece makeup brush collection',
        price: 2299.00,
        stock: 16,
        image_url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80',
        category_id: beautyCategory[0].id,
      },
      {
        name: 'Luxury Lipstick Collection',
        description: 'Set of 6 premium lipsticks with various shades',
        price: 1899.00,
        stock: 22,
        image_url: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=600&q=80',
        category_id: beautyCategory[0].id,
      },
    ];

    // Create products if they don't exist
    const allProducts = [...electronicsProducts, ...fashionProducts, ...homeProducts, ...beautyProducts];
    for (const product of allProducts) {
      await Product.findOrCreate({
        where: { name: product.name },
        defaults: product,
      });
    }

    console.log(`Created ${allProducts.length} products`);

    // Create admin user if not exists
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        name: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      },
    });

    console.log('Admin user created/verified');
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
