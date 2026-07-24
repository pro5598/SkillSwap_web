import { io } from "socket.io-client";

const token = "dummy_token_to_test_connection";

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
