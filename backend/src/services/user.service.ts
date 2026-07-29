import { UserMongoRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import {
  JWT_SECRET,
  GOOGLE_CLIENT_ID,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  FRONTEND_URL,
  GROQ_API_KEY,
} from "../configs/constant";

const userRepository = new UserMongoRepository();
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export class UserService {
  async createUser(
    userData: CreateUserDTO,
  ): Promise<{ user: Omit<IUser, "password">; token: string }> {
    const existingEmail = await userRepository.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new HttpException(400, "An account with this email already exists");
    }

    const existingUsername = await userRepository.getUserByUsername(
      userData.username,
    );
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
      { expiresIn: "7d" },
    );

    return { user: safeUser, token };
  }

  async loginUser(
    loginData: LoginUserDTO,
  ): Promise<{ user: Omit<IUser, "password">; token: string }> {
    const user = await userRepository.getUserByEmail(loginData.email);
    if (!user) {
      throw new HttpException(
        400,
        "Invalid email address or password combination",
      );
    }

    if (!user.password) {
      throw new HttpException(
        400,
        "This account uses Google Sign-In. Please use the Google button to log in.",
      );
    }

    const isPasswordValid = await bcryptjs.compare(
      loginData.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new HttpException(
        400,
        "Invalid email address or password combination",
      );
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    const userObj = user.toObject();
    const { password, ...safeUser } = userObj;

    return { user: safeUser, token };
  }

  async googleLogin(
    credential: string,
  ): Promise<{ user: Omit<IUser, "password">; token: string }> {
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
    } catch (err: any) {
      console.error("Google verifyIdToken error:", err);
      throw new HttpException(
        400,
        `Invalid Google credential: ${err.message || "Please try again."}`,
      );
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new HttpException(400, "Invalid Google token");
    }

    const { sub: googleId, email, given_name, family_name, picture } = payload;

    let user = await userRepository.getUserByGoogleId(googleId as string);

    if (!user) {
      user = await userRepository.getUserByEmail(email);
      if (user) {
        await userRepository.update(user._id.toString(), { googleId } as any);
        user.googleId = googleId;
      }
    }

    if (!user) {
      const emailPrefix = email.split("@")[0];
      let username = emailPrefix.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
      const existingUsername = await userRepository.getUserByUsername(username);
      if (existingUsername) {
        username = `${username}_${Date.now().toString(36)}`;
      }

      user = await userRepository.createUser({
        firstName: given_name || "User",
        lastName: family_name || "User",
        email: email.toLowerCase(),
        username,
        googleId,
        imageUrl: picture || undefined,
        role: "user",
      } as any);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    const userObj = user.toObject();
    const { password, ...safeUser } = userObj;

    return { user: safeUser, token };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await userRepository.update(user._id.toString(), {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000),
    } as any);

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SkillSwap" <${SMTP_USER}>`,
      to: user.email,
      subject: "Reset Your Password - SkillSwap",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0D1236;">Reset Your Password</h2>
          <p>Hi ${user.firstName},</p>
          <p>You requested a password reset for your SkillSwap account. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #F4A261; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 16px 0;">Reset Password</a>
          <p style="color: #4A5568; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userRepository.getUserByResetToken(hashedToken);

    if (!user) {
      throw new HttpException(400, "Invalid or expired reset token");
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    await userRepository.update(user._id.toString(), {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    } as any);
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
        throw new HttpException(
          400,
          "Current password is required to change password",
        );
      }
      if (!user.password) {
        throw new HttpException(400, "User has no password set");
      }
      const isPasswordValid = await bcryptjs.compare(
        updateData.currentPassword,
        user.password,
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

  async getAllUsers(query: any = {}) {
    const users = await userRepository.getAll(query);
    return users.map((user) => {
      const userObj = user.toObject();
      const { password, ...safeUser } = userObj;
      return safeUser;
    });
  }

  async getUserById(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    const userObj = user.toObject();
    const { password, ...safeUser } = userObj;
    return safeUser;
  }

  async deleteUser(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    await userRepository.delete(id);
    return true;
  }

  async adminUpdateUser(id: string, updateData: UpdateUserDTO) {
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
      const hashedPassword = await bcryptjs.hash(updateData.newPassword, 10);
      updateData.password = hashedPassword;
    } else if (updateData.password) {
      const hashedPassword = await bcryptjs.hash(updateData.password, 10);
      updateData.password = hashedPassword;
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

  async getSmartRecommendations(userId: string) {
    const currentUser = await userRepository.getUserById(userId);
    if (!currentUser) {
      throw new HttpException(404, "User not found");
    }

    // Get potential matches (excluding current user)
    const potentialMatches = await userRepository.getAll({
      _id: { $ne: currentUser._id },
    });
    const sampleMatches = potentialMatches.slice(0, 50);

    if (sampleMatches.length === 0) return [];

    if (!GROQ_API_KEY) {
      console.warn("GROQ_API_KEY is not set. Using basic matching fallback.");
      const simpleMatches = sampleMatches
        .filter((m) => {
          const userOffersWhatMWants = m.skillsWanted?.some((skill) =>
            currentUser.skillsOffered?.includes(skill),
          );
          const mOffersWhatUserWants = currentUser.skillsWanted?.some((skill) =>
            m.skillsOffered?.includes(skill),
          );
          return userOffersWhatMWants || mOffersWhatUserWants;
        })
        .slice(0, 5);

      return simpleMatches.map((u) => {
        const obj = u.toObject();
        const { password, ...safeUser } = obj;
        return safeUser;
      });
    }

    const { default: Groq } = await import("groq-sdk");
    const groq = new Groq({ apiKey: GROQ_API_KEY });

    const prompt = `
      You are a smart skill matching assistant.
      Current User:
      - Skills Offered: ${currentUser.skillsOffered?.join(", ") || ""}
      - Skills Wanted: ${currentUser.skillsWanted?.join(", ") || ""}
      - Bio: ${currentUser.bio || ""}

      Potential Matches:
      ${sampleMatches
        .map(
          (m) => `
      ID: ${m._id.toString()}
      Skills Offered: ${m.skillsOffered?.join(", ") || ""}
      Skills Wanted: ${m.skillsWanted?.join(", ") || ""}
      Bio: ${m.bio || ""}
      `,
        )
        .join("\n")}

      Find the top 5 matches based on skill synergy (where user A offers what user B wants, and vice versa).
      Return ONLY a JSON array of their IDs, e.g. ["id1", "id2"]. No markdown formatting, just the raw JSON array.
    `;

    try {
      const response = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.choices[0]?.message?.content;
      if (!text) return [];

      let recommendedIds: string[] = [];
      try {
        // Strip markdown blocks if any
        const cleanText = text
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        recommendedIds = JSON.parse(cleanText);
      } catch (e) {
        console.error("Failed to parse Groq response", e);
        return [];
      }

      const recommendedUsers = await Promise.all(
        recommendedIds.map((id) => userRepository.getUserById(id)),
      );

      // Filter out nulls and remove passwords
      return recommendedUsers
        .filter((u) => u !== null)
        .map((u) => {
          const obj = u!.toObject();
          const { password, ...safeUser } = obj;
          return safeUser;
        });
    } catch (error) {
      console.error("Groq API error:", error);
      // Fallback if AI fails
      const simpleMatches = sampleMatches
        .filter((m) => {
          const userOffersWhatMWants = m.skillsWanted?.some((skill) =>
            currentUser.skillsOffered?.includes(skill),
          );
          const mOffersWhatUserWants = currentUser.skillsWanted?.some((skill) =>
            m.skillsOffered?.includes(skill),
          );
          return userOffersWhatMWants || mOffersWhatUserWants;
        })
        .slice(0, 5);

      return simpleMatches.map((u) => {
        const obj = u.toObject();
        const { password, ...safeUser } = obj;
        return safeUser;
      });
    }
  }
}
