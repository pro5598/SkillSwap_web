import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";

export const authRouter = Router();
export const userRouter = Router();
const userController = new UserController();

authRouter.post("/register", userController.createUser);
authRouter.post("/login", userController.loginUser);
authRouter.post("/logout", userController.logoutUser);

userRouter.get("/", authorizedMiddleware, userController.getDiscoverUsers);
userRouter.get("/me", authorizedMiddleware, userController.getCurrentUser);

userRouter.put(
  "/update",
  authorizedMiddleware,
  uploads.single("profileImage"),
  userController.updateUser,
);

// Admin Routes
userRouter.get("/admin/all", authorizedMiddleware, adminMiddleware, userController.getAllUsers);
userRouter.get("/admin/:id", authorizedMiddleware, adminMiddleware, userController.getUserById);
userRouter.post("/admin/create", authorizedMiddleware, adminMiddleware, userController.adminCreateUser);
userRouter.put("/admin/:id", authorizedMiddleware, adminMiddleware, uploads.single("profileImage"), userController.adminUpdateUser);
userRouter.delete("/admin/:id", authorizedMiddleware, adminMiddleware, userController.adminDeleteUser);
