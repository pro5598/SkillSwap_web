import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./configs/constant";
import { MessageModel } from "./models/message.model";
import { SwapRequestModel } from "./models/swap-request.model";
import mongoose from "mongoose";

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Middleware for authentication
  io.use((socket, next) => {
    console.log("Socket connection attempt:", socket.id);
    let token = socket.handshake.auth.token;
    
    // Fallback to cookie if auth token is not provided (e.g., httpOnly cookie session)
    if (!token && socket.request.headers.cookie) {
      const cookies = socket.request.headers.cookie.split(";").reduce((acc: Record<string, string>, cookieString) => {
        const [key, value] = cookieString.trim().split("=");
        if (key && value) acc[key] = value;
        return acc;
      }, {});
      token = cookies["skillswap_auth_token"];
    }

    if (!token) {
      console.log("No token provided");
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET as string) as any;
      console.log("Socket token decoded:", decoded);
      socket.data.user = decoded; // { id: string }
      next();
    } catch (err) {
      console.log("Socket token verification failed:", err);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}, User ID: ${socket.data.user.id}`);

    // Join a personal room to receive messages
    socket.join(socket.data.user.id);

    socket.on("send_message", async (data: { receiverId: string; content: string; fileUrl?: string; fileType?: string }, callback) => {
      try {
        const { receiverId, content, fileUrl, fileType } = data;
        const senderId = socket.data.user.id;

        // Check if there's an accepted swap request between these users
        const swapRequest = await SwapRequestModel.findOne({
          $or: [
            { senderId, receiverId, status: "accepted" },
            { senderId: receiverId, receiverId: senderId, status: "accepted" },
          ]
        });

        if (!swapRequest) {
          if (callback) callback({ success: false, error: "You can only message accepted matches." });
          return;
        }

        // Save message to DB
        const message = new MessageModel({
          senderId,
          receiverId,
          content,
          fileUrl,
          fileType,
        });
        await message.save();

        // Emit to the receiver's personal room
        io.to(receiverId).emit("receive_message", message);

        // Emit back to sender so their UI can update immediately with DB ID and timestamp
        socket.emit("receive_message", message);

        if (callback) callback({ success: true, message });
      } catch (error) {
        console.error("Error sending message via socket:", error);
        if (callback) callback({ success: false, error: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
