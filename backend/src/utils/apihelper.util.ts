import { Response } from "express";

export interface ApiResponseFormat<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  statusCode: number;
}

export class ApiResponseHelper {
  static success<T>(
    res: Response,
    data: T | null = null,
    message: string = "Operation successful",
    statusCode: number = 200,
  ): Response {
    const responseBody: ApiResponseFormat<T> = {
      success: true,
      message,
      data,
      statusCode,
    };
    return res.status(statusCode).json(responseBody);
  }

  static error(
    res: Response,
    message: string = "An error occurred on the server",
    statusCode: number = 500,
  ): Response {
    const responseBody: ApiResponseFormat<null> = {
      success: false,
      message,
      data: null,
      statusCode,
    };
    return res.status(statusCode).json(responseBody);
  }
}
