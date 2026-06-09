import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const userRouter = Router();
const userController = new UserController();

userRouter.post("/register", userController.createUser);

userRouter.post("/login", userController.loginUser);

userRouter.post("/logout", userController.logoutUser);

userRouter.get("/me", authorizedMiddleware, userController.getCurrentUser);

export default userRouter;
