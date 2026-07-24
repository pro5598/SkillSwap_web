import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("skillswap_auth_token");

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5002";

    // Connect explicitly to backend for Socket.IO
    const socketInstance = io(SOCKET_URL, {
      auth: token ? { token } : {}, // Send token if available, otherwise backend reads cookie
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connect_error:", err.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, isConnected };
};
