import { UserMongoRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/constant";

const userRepository = new UserMongoRepository();

export class UserService {

  async createUser(userData: CreateUserDTO): Promise<{ user: Omit<IUser, "password">; token: string }> {
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

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" } 
    );

    return { user: safeUser, token };
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

  async updateUser(id: string, updateData: UpdateUserDTO) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await userRepository.getUserByEmail(
        updateData.email,
      );
      if (existingEmail) {
        throw new HttpException(400, "Email already exists");
      }
    }
    if (updateData.username && updateData.username !== user.username) {
      const existingUsername = await userRepository.getUserByUsername(
        updateData.username,
      );
      if (existingUsername) {
        throw new HttpException(400, "Username already exists");
      }
    }
    if (updateData.newPassword) {
      if (!updateData.currentPassword) {
        throw new HttpException(400, "Current password is required to change password");
      }
      const isPasswordValid = await bcryptjs.compare(
        updateData.currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        throw new HttpException(400, "Invalid current password");
      }
      const hashedPassword = await bcryptjs.hash(updateData.newPassword, 10);
      updateData.password = hashedPassword;
    } else if (updateData.password) {
      delete updateData.password;
    }
    
    delete updateData.currentPassword;
    delete updateData.newPassword;
    const updatedUser = await userRepository.update(id, updateData);
    if (updatedUser) {
        const userObj = updatedUser.toObject();
        const { password, ...safeUser } = userObj;
        return safeUser;
    }
    return null;
  }
}