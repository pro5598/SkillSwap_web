import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { HttpException } from "../src/exceptions/http-exception";
import { ApiResponseHelper } from "../src/utils/apihelper.util";
import { reviewRouter } from "../src/routes/review.route";
import { authRouter, userRouter } from "../src/routes/user.route";
import { skillRouter } from "../src/routes/skill.route";
import { swapRequestRouter } from "../src/routes/swap-request.route";
import { messageRouter } from "../src/routes/message.route";
import { sessionRouter } from "../src/routes/session.route";

const app: Application = express();

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Blocked by SkillSwap Security CORS Configuration Matrix"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

import { notificationRouter } from "../src/routes/notification.route";
import { stripeRouter } from "../src/routes/stripe.route";

// Mount stripe webhook before express.json() so it can use express.raw()
app.use("/api/v1/stripe/webhook", express.raw({ type: "application/json" }));

// Global Middlewares
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Feature API Context Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/skills", skillRouter);
app.use("/api/v1/swap-requests", swapRequestRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/sessions", sessionRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/stripe", stripeRouter);

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
