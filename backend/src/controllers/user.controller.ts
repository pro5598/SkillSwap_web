import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO, GoogleAuthDTO, ForgotPasswordDTO, ResetPasswordDTO } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { IUser, UserModel } from "../models/user.model";
import { SkillModel } from "../models/skill.model";
import { SwapRequestModel } from "../models/swap-request.model";
import { SessionModel } from "../models/session.model";

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
    this.googleLogin = this.googleLogin.bind(this);
    this.logoutUser = this.logoutUser.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    this.getDiscoverUsers = this.getDiscoverUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.adminCreateUser = this.adminCreateUser.bind(this);
    this.adminUpdateUser = this.adminUpdateUser.bind(this);
    this.adminDeleteUser = this.adminDeleteUser.bind(this);
    this.getAdminStats = this.getAdminStats.bind(this);
    this.getRecommendations = this.getRecommendations.bind(this);
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

  async googleLogin(req: Request, res: Response) {
    try {
      const parsedData = GoogleAuthDTO.safeParse(req.body);

      if (!parsedData.success) {
        return ApiResponseHelper.error(res, "Google credential is required", 400);
      }

      const { user, token } = await this.userService.googleLogin(parsedData.data.credential);

      res.cookie("skillswap_auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return ApiResponseHelper.success(res, { user, token }, "Google login successful");
    } catch (error: any) {
      console.error("Google authentication failed in controller:", error);
      return ApiResponseHelper.error(
        res,
        error.message || "Google authentication failed",
        error.status || 500,
      );
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const parsedData = ForgotPasswordDTO.safeParse(req.body);

      if (!parsedData.success) {
        return ApiResponseHelper.error(res, "Valid email is required", 400);
      }

      await this.userService.forgotPassword(parsedData.data.email);

      return ApiResponseHelper.success(
        res,
        null,
        "If an account with that email exists, a password reset link has been sent",
      );
    } catch (error: any) {
      return ApiResponseHelper.success(
        res,
        null,
        "If an account with that email exists, a password reset link has been sent",
      );
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const parsedData = ResetPasswordDTO.safeParse(req.body);

      if (!parsedData.success) {
        return ApiResponseHelper.error(res, "Token and new password are required", 400);
      }

      await this.userService.resetPassword(parsedData.data.token, parsedData.data.newPassword);

      return ApiResponseHelper.success(res, null, "Password has been reset successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Password reset failed",
        error.status || 500,
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

  async getAdminStats(req: Request, res: Response) {
    try {
      const [totalUsers, totalSkills, totalSwapRequests, totalSessions, recentUsers, pendingSkills] = await Promise.all([
        UserModel.countDocuments(),
        SkillModel.countDocuments(),
        SwapRequestModel.countDocuments(),
        SessionModel.countDocuments(),
        UserModel.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 }).limit(5).select("firstName lastName email role createdAt imageUrl"),
        SkillModel.countDocuments({ isApproved: false })
      ]);

      const swapRequestsByStatus = await SwapRequestModel.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const sessionsByStatus = await SessionModel.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      return ApiResponseHelper.success(res, {
        totalUsers,
        totalSkills,
        pendingSkills,
        totalSwapRequests,
        totalSessions,
        recentUsers,
        swapRequestsByStatus,
        sessionsByStatus,
      }, "Admin stats retrieved successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async getRecommendations(req: Request, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const user = await this.userService.getUserById(req.user._id.toString());
      if (!user || user.subscriptionStatus !== "pro") {
        return ApiResponseHelper.error(
          res,
          "Upgrade to Pro to access AI recommendations",
          403
        );
      }
      
      const recommendations = await this.userService.getSmartRecommendations(req.user._id.toString());
      
      return ApiResponseHelper.success(
        res,
        recommendations,
        "Recommendations retrieved successfully"
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Failed to get recommendations",
        error.status || 500
      );
    }
  }
}
