import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import Category from '../models/Category.js';
import Menu from '../models/Menu.js';
import User from '../models/User.js';

const seedDefaultAdmin = async () => {
  try {
    const defaultAdmins = ['praveenmedida42@gmail.com', 'molletichandana8@gmail.com'];
    
    // Remove any administrators not in the default list
    const deleteResult = await Admin.deleteMany({ email: { $nin: defaultAdmins } });
    if (deleteResult.deletedCount > 0) {
      console.log(`Removed ${deleteResult.deletedCount} old/unauthorized admin emails.`);
    }

    // Downgrade any users to 'user' role if their email is not in the allowed admin list but they are marked as 'admin'
    const downgradeResult = await User.updateMany(
      { email: { $nin: defaultAdmins }, role: 'admin' },
      { role: 'user' }
    );
    if (downgradeResult.modifiedCount > 0) {
      console.log(`Downgraded ${downgradeResult.modifiedCount} users back to regular user role.`);
    }

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
    const dinnerCategory = await Category.findOne({ name: 'Dinner' });
    if (!dinnerCategory) {
      console.log('Dinner category not found. Restructuring categories to Breakfast, Lunch, and Dinner...');
      
      // Clear existing to avoid duplicate conflicts and ensure fresh transition to the new layout
      await Category.deleteMany({});
      await Menu.deleteMany({});
      
      const breakfast = await Category.create({ name: 'Breakfast', description: 'Delicious morning tiffins' });
      const lunch = await Category.create({ name: 'Lunch', description: 'Hearty meals and biryanis' });
      const dinner = await Category.create({ name: 'Dinner', description: 'Perfect dinner choices' });
      
      console.log('Seeded categories: Breakfast, Lunch, Dinner');

      await Menu.create([
        // Breakfast (Tiffins)
        { name: 'Masala Dosa', price: 60, category: breakfast._id, imageURL: '/images/masala_dosa.png', isAvailable: true },
        { name: 'Idli Sambar', price: 40, category: breakfast._id, imageURL: '/images/idli_sambar.png', isAvailable: true },
        { name: 'Medu Vada', price: 50, category: breakfast._id, imageURL: '/images/medu_vada.png', isAvailable: true },
        { name: 'Poori Curry', price: 60, category: breakfast._id, imageURL: '/images/poori_curry.png', isAvailable: true },
        
        // Lunch (Biryani & Meals)
        { name: 'Chicken Biryani', price: 220, category: lunch._id, imageURL: '/images/chicken_biryani.png', isAvailable: true },
        { name: 'Paneer Biryani', price: 180, category: lunch._id, imageURL: '/images/paneer_biryani.png', isAvailable: true },
        { name: 'Veg Meals', price: 120, category: lunch._id, imageURL: '/images/veg_meals.png', isAvailable: true },
        
        // Dinner (Fried rice, Noodles, Chapati)
        { name: 'Chapati Curry', price: 80, category: dinner._id, imageURL: '/images/chapati_curry.png', isAvailable: true },
        { name: 'Egg Fried Rice', price: 110, category: dinner._id, imageURL: '/images/egg_fried_rice.png', isAvailable: true },
        { name: 'Chicken Noodles', price: 130, category: dinner._id, imageURL: '/images/chicken_noodles.png', isAvailable: true }
      ]);
      console.log('Seeded new menu items.');
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
    
    // Check and drop old googleId_1 index on users collection if it exists
    try {
      const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
      if (collections.length > 0) {
        const indexes = await mongoose.connection.db.collection('users').indexes();
        const hasGoogleIdIndex = indexes.some(index => index.name === 'googleId_1');
        if (hasGoogleIdIndex) {
          await mongoose.connection.db.collection('users').dropIndex('googleId_1');
          console.log('Successfully dropped old googleId_1 index from users collection');
        }
      }
    } catch (indexError) {
      console.error('Error checking/dropping old googleId_1 index:', indexError);
    }

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
