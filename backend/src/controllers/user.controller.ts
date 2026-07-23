import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { IUser } from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: Record<string, any> | IUser;
      file?: any;
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
    this.updateUser = this.updateUser.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    this.getDiscoverUsers = this.getDiscoverUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.adminCreateUser = this.adminCreateUser.bind(this);
    this.adminUpdateUser = this.adminUpdateUser.bind(this);
    this.adminDeleteUser = this.adminDeleteUser.bind(this);
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

      const { user, token } = await this.userService.createUser(userData.data);

      res.cookie("skillswap_auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return ApiResponseHelper.success(
        res,
        { user, token },
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

      return ApiResponseHelper.success(res, { user, token }, "Login successful");
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

  async updateUser(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?._id || (req.user as any)?.id;
      const filename = req.file?.filename;
      if (!userId) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      if (req.body.skillsOffered && typeof req.body.skillsOffered === "string") {
        try {
          req.body.skillsOffered = JSON.parse(req.body.skillsOffered);
        } catch (e) {

        }
      }
      if (req.body.skillsWanted && typeof req.body.skillsWanted === "string") {
        try {
          req.body.skillsWanted = JSON.parse(req.body.skillsWanted);
        } catch (e) {

        }
      }

      const parsedData = UpdateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        const fieldErrors = parsedData.error.flatten().fieldErrors;
        const validationErrorMessage = Object.entries(fieldErrors)
          .map(([field, msgs]) => `${field}: ${msgs?.join(", ")}`)
          .join(" | ");

        return ApiResponseHelper.error(res, validationErrorMessage, 400);
      }

      if (filename) {
        parsedData.data.imageUrl = "/uploads/" + filename;
      }

      const updatedUser = await this.userService.updateUser(userId.toString(), parsedData.data);
      return ApiResponseHelper.success(
        res,
        { user: updatedUser },
        "User updated successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userService.getAllUsers();
      return ApiResponseHelper.success(res, { users }, "Users retrieved successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async getDiscoverUsers(req: Request, res: Response) {
    try {
      const users = await this.userService.getAllUsers({ role: { $ne: "admin" } });
      return ApiResponseHelper.success(res, { users }, "Discover users retrieved successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id as string);
      return ApiResponseHelper.success(res, { user }, "User retrieved successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async adminCreateUser(req: Request, res: Response) {
    try {
      const userData = CreateUserDTO.safeParse(req.body);
      if (!userData.success) {
        const fieldErrors = userData.error.flatten().fieldErrors;
        const validationErrorMessage = Object.entries(fieldErrors)
          .map(([field, msgs]) => `${field}: ${msgs?.join(", ")}`)
          .join(" | ");
        return ApiResponseHelper.error(res, validationErrorMessage, 400);
      }

      const { user } = await this.userService.createUser(userData.data);
      return ApiResponseHelper.success(res, { user }, "User created successfully", 201);
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async adminUpdateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedData = UpdateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        const fieldErrors = parsedData.error.flatten().fieldErrors;
        const validationErrorMessage = Object.entries(fieldErrors)
          .map(([field, msgs]) => `${field}: ${msgs?.join(", ")}`)
          .join(" | ");
        return ApiResponseHelper.error(res, validationErrorMessage, 400);
      }

      const filename = req.file?.filename;
      if (filename) {
        parsedData.data.imageUrl = "/uploads/" + filename;
      }

      const updatedUser = await this.userService.adminUpdateUser(id as string, parsedData.data);
      return ApiResponseHelper.success(res, { user: updatedUser }, "User updated successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async adminDeleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id as string);
      return ApiResponseHelper.success(res, null, "User deleted successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }
}
