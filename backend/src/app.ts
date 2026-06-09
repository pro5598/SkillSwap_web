import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { HttpException } from "./exceptions/http-exception";
import { ApiResponseHelper } from "./utils/apihelper.util";
import userRoutes from "./routes/user.route";

const app: Application = express();

const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api/v1/auth", userRoutes);

app.use((req: Request, res: Response) => {
  return ApiResponseHelper.error(res, "Requested API Route Not Found", 404);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Captured Server Error Context:", err.message);

  if (err instanceof HttpException) {
    return ApiResponseHelper.error(res, err.message, err.status);
  }

  return ApiResponseHelper.error(
    res,
    "Internal Server Error Context Unresolved",
    500,
  );
});

export default app;
