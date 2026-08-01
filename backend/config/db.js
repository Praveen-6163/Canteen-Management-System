import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import Category from '../models/Category.js';
import Menu from '../models/Menu.js';

const seedDefaultAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({ email: 'praveenmedida42@gmail.com' });
      console.log('Seeded default admin email: praveenmedida42@gmail.com');
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
          { name: 'Classic Burger', price: 120, category: snacks._id, imageURL: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', isAvailable: true },
          { name: 'Cheese Pizza', price: 250, category: lunch._id, imageURL: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500', isAvailable: true },
          { name: 'Club Sandwich', price: 90, category: breakfast._id, imageURL: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500', isAvailable: true },
          { name: 'Garden Salad', price: 110, category: lunch._id, imageURL: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500', isAvailable: true },
          { name: 'Hot Espresso', price: 60, category: beverages._id, imageURL: 'https://images.unsplash.com/photo-1510972527409-cef7e2b94902?w=500', isAvailable: true }
        ]);
        console.log('Seeded default menu items.');
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
