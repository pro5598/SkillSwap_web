import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { UserModel } from "../src/models/user.model";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/skillswap_db");
    console.log("Connected to MongoDB.");

    const existingAdmin = await UserModel.findOne({ email: "admin@skillswap.com" });
    if (existingAdmin) {
      console.log("Admin account already exists!");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const admin = new UserModel({
      firstName: "Super",
      lastName: "Admin",
      email: "admin@skillswap.com",
      username: "admin",
      phoneNumber: "1234567890",
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log("Admin account created successfully.");
    console.log("Email: admin@skillswap.com");
    console.log("Password: admin123");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
