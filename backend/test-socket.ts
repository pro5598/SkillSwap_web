import { io } from "socket.io-client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const token = jwt.sign(
  { id: "6a562c299c791d84c1b56519", email: "test@test.com", role: "user" },
  process.env.JWT_SECRET || "fallback_skillswap_secret_key"
);

const socket = io("http://localhost:5002", {
  auth: { token },
});

socket.on("connect", () => {
  console.log("Connected successfully! ID:", socket.id);
  process.exit(0);
});

socket.on("connect_error", (err) => {
  console.error("Connection Error:", err.message);
  process.exit(1);
});

setTimeout(() => {
  console.error("Timeout waiting for connection");
  process.exit(1);
}, 3000);
