import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { IUser } from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: Record<string, any> | IUser;
    }
  }
}

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();

    this.createUser = this.createUser.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.logoutUser = this.logoutUser.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
  }

  async createUser(req: Request, res: Response) {
    try {
      const userData = CreateUserDTO.safeParse(req.body);

      if (!userData.success) {
        const fieldErrors = userData.error.flatten().fieldErrors;
        const validationErrorMessage = Object.entries(fieldErrors)
          .map(([field, msgs]) => `${field}: ${msgs?.join(", ")}`)
          .join(" | ");

        return ApiResponseHelper.error(res, validationErrorMessage, 400);
      }

      const user = await this.userService.createUser(userData.data);
      return ApiResponseHelper.success(
        res,
        user,
        "User registered successfully",
        201,
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async loginUser(req: Request, res: Response) {
    try {
      const parsedData = LoginUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        const fieldErrors = parsedData.error.flatten().fieldErrors;
        const validationErrorMessage = Object.entries(fieldErrors)
          .map(([field, msgs]) => `${field}: ${msgs?.join(", ")}`)
          .join(" | ");

        return ApiResponseHelper.error(res, validationErrorMessage, 400);
      }

      const { user, token } = await this.userService.loginUser(parsedData.data);

      res.cookie("skillswap_auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return ApiResponseHelper.success(res, { user }, "Login successful");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async logoutUser(req: Request, res: Response) {
    try {
      res.clearCookie("skillswap_auth_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return ApiResponseHelper.success(res, null, "Logged out successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        "Could not complete logout operation",
        500,
      );
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return ApiResponseHelper.error(res, "User not authenticated", 401);
      }
      return ApiResponseHelper.success(res, { user: req.user }, "User details retrieved successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }
}
