import dotenv from "dotenv";
dotenv.config();

export const MONGODB_URL = process.env.DATABASE_URL || "mongodb://localhost:27017/skillswap_db";
export const PORT = process.env.PORT || 5002;
export const JWT_SECRET = process.env.JWT_SECRET || "fallback_skillswap_secret_key";
export const NODE_ENV = process.env.NODE_ENV || "development";

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

export const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
export const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
export const SMTP_USER = process.env.SMTP_USER || "";
export const SMTP_PASS = process.env.SMTP_PASS || "";
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
export const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || "";
