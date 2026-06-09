import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/constant";
import { IUser } from "../models/user.model";
import { UserMongoRepository } from "../repositories/user.repository";
import { HttpException } from "../exceptions/http-exception";
import { ApiResponseHelper } from "../utils/apihelper.util";

declare global {
  namespace Express {
    interface Request {
      user?: Record<string, any> | IUser;
    }
  }
}

const userRepository = new UserMongoRepository();

export const authorizedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.skillswap_auth_token;

    if (!token) {
      throw new HttpException(401, "Authentication required. Please sign in.");
    }

    // Verify signature token against  local secret string
    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      throw new HttpException(
        401,
        "Session expired or invalid. Please sign in again.",
      );
    }

    if (!decodedToken || !decodedToken.id) {
      throw new HttpException(401, "Malformed session verification payload.");
    }

    const user = await userRepository.getUserById(decodedToken.id);
    if (!user) {
      throw new HttpException(
        401,
        "User profile not found in active database registries.",
      );
    }

    req.user = user;

    return next();
  } catch (err: any) {
    return ApiResponseHelper.error(
      res,
      err.message || "Internal Server Error",
      err.status || 401,
    );
  }
};

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new HttpException(
        401,
        "Access denied. User session unauthenticated.",
      );
    }

    if (req.user.role !== "admin") {
      throw new HttpException(
        403,
        "Access forbidden. Administrative permissions required.",
      );
    }

    return next();
  } catch (err: any) {
    return ApiResponseHelper.error(
      res,
      err.message || "Internal Server Error",
      err.status || 403,
    );
  }
};
