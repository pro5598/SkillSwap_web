import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";

export const authRouter = Router();
export const userRouter = Router();
const userController = new UserController();

authRouter.post("/register", userController.createUser);
authRouter.post("/login", userController.loginUser);
authRouter.post("/logout", userController.logoutUser);

userRouter.get("/me", authorizedMiddleware, userController.getCurrentUser);

userRouter.put(
  "/update",
  authorizedMiddleware,
  uploads.single("profileImage"),
  userController.updateUser,
);
