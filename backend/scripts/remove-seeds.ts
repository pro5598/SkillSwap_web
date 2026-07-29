import mongoose from "mongoose";
import dotenv from "dotenv";
import { UserModel } from "../src/models/user.model";

dotenv.config();

const removeSeededUsers = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/skillswap_db");
    console.log("Connected to MongoDB.");

    // Delete all users that have an email ending in @example.com
    const result = await UserModel.deleteMany({ email: { $regex: /@example\.com$/ } });
    
    console.log(`Successfully removed ${result.deletedCount} seeded users.`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error removing seeded users:", error);
    process.exit(1);
  }
};

removeSeededUsers();
