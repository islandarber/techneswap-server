import mongoose from 'mongoose';

export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB);
    console.log('Connected to the database');
    return mongoose.connection;
  } catch (error) {
    console.log('Error connecting to the database: ', error);
    process.exit(1);
  }
};