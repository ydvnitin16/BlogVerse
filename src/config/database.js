import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Database Connected.`);
  } catch (err) {
    console.log(`Error in connecting database.`);
    process.exit(1);
  }
}

export { connectDB };
