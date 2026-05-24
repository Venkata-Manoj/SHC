import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/simats-hackathon';
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      isConnected = true;
      console.log(`MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt}/3 failed: ${err.message}`);
      if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
    }
  }
  console.error('MongoDB connection failed after 3 attempts — exiting');
  process.exit(1);
}

export function getConnectionStatus() {
  return isConnected;
}
