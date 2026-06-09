import { UserMongoRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/constant";

const userRepository = new UserMongoRepository();

export class UserService {

  async createUser(userData: CreateUserDTO): Promise<Omit<IUser, "password">> {
    const existingEmail = await userRepository.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new HttpException(400, "An account with this email already exists");
    }

    const existingUsername = await userRepository.getUserByUsername(userData.username);
    if (existingUsername) {
      throw new HttpException(400, "This username is already taken");
    }

    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(userData.password, saltRounds);
    userData.password = hashedPassword;

    const user = await userRepository.createUser(userData);

    const userObj = user.toObject();
    const { password, ...safeUser } = userObj;

    return safeUser;
  }


  async loginUser(loginData: LoginUserDTO): Promise<{ user: Omit<IUser, "password">; token: string }> {
    // 1. Verify user profile exists by matching email
    const user = await userRepository.getUserByEmail(loginData.email);
    if (!user) {
      throw new HttpException(400, "Invalid email address or password combination");
    }

    const isPasswordValid = await bcryptjs.compare(
      loginData.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new HttpException(400, "Invalid email address or password combination");
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" } 
    );

    const userObj = user.toObject();
    const { password, ...safeUser } = userObj;

    return { user: safeUser, token };
  }
}