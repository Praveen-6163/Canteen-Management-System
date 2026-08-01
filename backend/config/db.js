import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Set connection timeout to 3 seconds so it fails fast if not running
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n⚠️ MongoDB Connection Failed: ${error.message}\n`);
    process.exit(1);
  }
};

export default connectDB;
