import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import Category from '../models/Category.js';
import Menu from '../models/Menu.js';
import User from '../models/User.js';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const seedDefaultAdmin = async () => {
  try {
    const defaultAdmins = ['praveenmedida42@gmail.com', 'molletichandana8@gmail.com'];
    
    for (const email of defaultAdmins) {
      const normalizedEmail = email.toLowerCase();
      const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const exists = await Admin.findOne({ email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } });
      if (!exists) {
        await Admin.create({ email: normalizedEmail });
        console.log(`Seeded default admin email: ${email}`);
      }
      
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
          { name: 'Masala Dosa', price: 60, category: breakfast._id, imageURL: '/images/masala_dosa.png', isAvailable: true },
          { name: 'Idli Sambar', price: 40, category: breakfast._id, imageURL: '/images/idli_sambar.png', isAvailable: true },
          { name: 'Medu Vada', price: 50, category: breakfast._id, imageURL: '/images/medu_vada.png', isAvailable: true },
          { name: 'Poori Curry', price: 60, category: breakfast._id, imageURL: '/images/poori_curry.png', isAvailable: true },
          { name: 'Chicken Biryani', price: 220, category: lunch._id, imageURL: '/images/chicken_biryani.png', isAvailable: true },
          { name: 'Paneer Biryani', price: 180, category: lunch._id, imageURL: '/images/paneer_biryani.png', isAvailable: true },
          { name: 'Veg Meals', price: 120, category: lunch._id, imageURL: '/images/veg_meals.png', isAvailable: true },
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
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://praveenmedida42_db_user:Praveen1234@cluster0.ucbfduh.mongodb.net/canteenDB?retryWrites=true&w=majority&appName=Cluster0';

    const opts = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(mongoUri, opts).then((mongooseInstance) => {
      console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
      seedDefaultAdmin().catch(e => console.error('Admin seed error:', e));
      seedDefaultCategoriesAndMenu().catch(e => console.error('Menu seed error:', e));
      return mongooseInstance;
    }).catch(err => {
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

export default connectDB;


