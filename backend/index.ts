import app from "./src/app";
import { PORT as API_PORT } from "./src/configs/constant";
import { connectToMongoDB } from "./src/database/mongodb";

const startApplicationServer = async () => {
  try {
    await connectToMongoDB();

    app.listen(Number(API_PORT), () => {
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
