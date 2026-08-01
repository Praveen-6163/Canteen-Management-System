import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import Category from '../models/Category.js';
import Menu from '../models/Menu.js';
import User from '../models/User.js';

const seedDefaultAdmin = async () => {
  try {
    const defaultAdmins = ['praveenmedida42@gmail.com', 'molletichandana8@gmail.com'];
    for (const email of defaultAdmins) {
      const exists = await Admin.findOne({ email });
      if (!exists) {
        await Admin.create({ email });
        console.log(`Seeded default admin email: ${email}`);
      }
      
      // Also update existing user record to admin role if they exist
      await User.updateOne({ email }, { role: 'admin' });
    }
  } catch (error) {
    console.error('Error seeding default admin:', error);
  }
};

const seedDefaultCategoriesAndMenu = async () => {
  try {
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const breakfast = await Category.create({ name: 'Breakfast', description: 'Start your morning right' });
      const lunch = await Category.create({ name: 'Lunch', description: 'Hearty afternoon meals' });
      const snacks = await Category.create({ name: 'Snacks', description: 'Quick bites and refreshments' });
      const beverages = await Category.create({ name: 'Beverages', description: 'Hot and cold drinks' });
      console.log('Seeded default categories: Breakfast, Lunch, Snacks, Beverages');

      const menuCount = await Menu.countDocuments();
      if (menuCount === 0) {
        await Menu.create([
          { name: 'Classic Burger', price: 120, category: snacks._id, imageURL: '/images/classic_burger.png', isAvailable: true },
          { name: 'Cheese Pizza', price: 250, category: lunch._id, imageURL: '/images/cheese_pizza.png', isAvailable: true },
          { name: 'Club Sandwich', price: 90, category: breakfast._id, imageURL: '/images/club_sandwich.png', isAvailable: true },
          { name: 'Garden Salad', price: 110, category: lunch._id, imageURL: '/images/garden_salad.png', isAvailable: true },
          { name: 'Hot Espresso', price: 60, category: beverages._id, imageURL: '/images/hot_espresso.png', isAvailable: true }
        ]);
        console.log('Seeded default menu items.');
      } else {
        await Menu.updateOne({ name: 'Classic Burger' }, { imageURL: '/images/classic_burger.png' });
        await Menu.updateOne({ name: 'Cheese Pizza' }, { imageURL: '/images/cheese_pizza.png' });
        await Menu.updateOne({ name: 'Club Sandwich' }, { imageURL: '/images/club_sandwich.png' });
        await Menu.updateOne({ name: 'Garden Salad' }, { imageURL: '/images/garden_salad.png' });
        await Menu.updateOne({ name: 'Hot Espresso' }, { imageURL: '/images/hot_espresso.png' });
        console.log('Updated existing default menu item image URLs to realistic local assets.');
      }
    }
  } catch (error) {
    console.error('Error seeding default categories/menu:', error);
  }
};

const connectDB = async () => {
  try {
    // Set connection timeout to 3 seconds so it fails fast if not running
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default admin email if collection is empty
    await seedDefaultAdmin();
    // Seed default categories & menu if collection is empty
    await seedDefaultCategoriesAndMenu();
  } catch (error) {
    console.error(`\n⚠️ MongoDB Connection Failed: ${error.message}\n`);
    process.exit(1);
  }
};

export default connectDB;
