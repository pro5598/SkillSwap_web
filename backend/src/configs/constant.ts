import dotenv from "dotenv";
dotenv.config();

export const MONGODB_URL =
  process.env.DATABASE_URL || "mongodb://localhost:27017/skillswap_db";
export const PORT = process.env.PORT || 5000;
export const JWT_SECRET =
  process.env.JWT_SECRET || "fallback_skillswap_secret_key";
export const NODE_ENV = process.env.NODE_ENV || "development";
