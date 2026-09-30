import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import Category from '../models/Category.js';
import Menu from '../models/Menu.js';
import User from '../models/User.js';

const seedDefaultAdmin = async () => {
  try {
    const defaultAdmins = ['praveenmedida42@gmail.com', 'molletichandana8@gmail.com'];
    
    // Seed default admin records if missing
    for (const email of defaultAdmins) {
      const normalizedEmail = email.toLowerCase();
      const exists = await Admin.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } });
      if (!exists) {
        await Admin.create({ email: normalizedEmail });
        console.log(`Seeded default admin email: ${email}`);
      }
      
      // Update existing user record to admin role if found
      await User.updateOne({ email: normalizedEmail }, { role: 'admin' });
    }
  } catch (error) {
    console.error('Error seeding default admin:', error);
  }
};

const seedDefaultCategoriesAndMenu = async () => {
  try {
    const dinnerCategory = await Category.findOne({ name: 'Dinner' });
    if (!dinnerCategory) {
      const count = await Category.countDocuments();
      if (count === 0) {
        const breakfast = await Category.create({ name: 'Breakfast', description: 'Delicious morning tiffins' });
        const lunch = await Category.create({ name: 'Lunch', description: 'Hearty meals and biryanis' });
        const dinner = await Category.create({ name: 'Dinner', description: 'Perfect dinner choices' });
        
        await Menu.create([
          // Breakfast
          { name: 'Masala Dosa', price: 60, category: breakfast._id, imageURL: '/images/masala_dosa.png', isAvailable: true },
          { name: 'Idli Sambar', price: 40, category: breakfast._id, imageURL: '/images/idli_sambar.png', isAvailable: true },
          { name: 'Medu Vada', price: 50, category: breakfast._id, imageURL: '/images/medu_vada.png', isAvailable: true },
          { name: 'Poori Curry', price: 60, category: breakfast._id, imageURL: '/images/poori_curry.png', isAvailable: true },
          
          // Lunch
          { name: 'Chicken Biryani', price: 220, category: lunch._id, imageURL: '/images/chicken_biryani.png', isAvailable: true },
          { name: 'Paneer Biryani', price: 180, category: lunch._id, imageURL: '/images/paneer_biryani.png', isAvailable: true },
          { name: 'Veg Meals', price: 120, category: lunch._id, imageURL: '/images/veg_meals.png', isAvailable: true },
          
          // Dinner
          { name: 'Chapati Curry', price: 80, category: dinner._id, imageURL: '/images/chapati_curry.png', isAvailable: true },
          { name: 'Egg Fried Rice', price: 110, category: dinner._id, imageURL: '/images/egg_fried_rice.png', isAvailable: true },
          { name: 'Chicken Noodles', price: 130, category: dinner._id, imageURL: '/images/chicken_noodles.png', isAvailable: true }
        ]);
        console.log('Seeded new menu items.');
      }
    }
  } catch (error) {
    console.error('Error seeding default categories/menu:', error);
  }
};

const connectDB = async () => {
  // Reuse existing connection in serverless environments
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb+srv://praveenmedida42_db_user:Praveen1234@cluster0.ucbfduh.mongodb.net/canteenDB?retryWrites=true&w=majority&appName=Cluster0';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000, // 15 seconds for serverless cold connections
      connectTimeoutMS: 15000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Background non-blocking indexing and seeding tasks
    seedDefaultAdmin().catch(e => console.error('Admin seed error:', e));
    seedDefaultCategoriesAndMenu().catch(e => console.error('Menu seed error:', e));

  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    throw error;
  }
};

export default connectDB;

