import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

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

const connectDB = async () => {
  try {
    // Set connection timeout to 3 seconds so it fails fast if not running
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default admin email if collection is empty
    await seedDefaultAdmin();
  } catch (error) {
    console.error(`\n⚠️ MongoDB Connection Failed: ${error.message}\n`);
    process.exit(1);
  }
};

export default connectDB;
