import mongoose from "mongoose";
import { MONGODB_URL } from "../configs/constant";

export const connectToMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log(" Connected to SkillSwap MongoDB successfully");
  } catch (error) {
    console.error(" Error connecting to SkillSwap MongoDB:", error);
    process.exit(1); // Force terminate application if database cannot be reached
  }
};
