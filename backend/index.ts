import app from "./src/app";
import { PORT as API_PORT } from "./src/configs/constant";
import { connectToMongoDB } from "./src/database/mongodb";
import { createServer } from "http";
import { initializeSocket } from "./src/socket";

const startApplicationServer = async () => {
  try {
    await connectToMongoDB();

    const httpServer = createServer(app);
    initializeSocket(httpServer);

    httpServer.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `Port ${API_PORT} is already in use. Another backend instance is already running.`,
        );
        console.error(
          "Stop the other process, or run: npx kill-port 5002",
        );
      } else {
        console.error("Server failed to start:", err.message);
      }
      process.exit(1);
    });

    httpServer.listen(Number(API_PORT), "127.0.0.1", () => {
      console.log(`SkillSwap Server Online on port: ${API_PORT}`);
    });
  } catch (initializationError) {
    console.error(
      "Server Initialization failure:",
      initializationError,
    );
    process.exit(1);
  }
};

startApplicationServer();
