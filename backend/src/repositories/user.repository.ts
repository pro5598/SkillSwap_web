import { UserModel, IUser } from "../models/user.model";

export interface IUserRepository {
  getUserByEmail(email: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;
  createUser(user: Partial<IUser>): Promise<IUser>;
  getUserById(id: string): Promise<IUser | null>;
  getAll(query?: any): Promise<IUser[]>;
  update(id: string, user: Partial<IUser>): Promise<IUser | null>;
  delete(id: string): Promise<boolean>;

  findMatchesForUser(skillsDesired: string[]): Promise<IUser[]>;
}

export class UserMongoRepository implements IUserRepository {
  async getUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email: email.toLowerCase() });
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    return await UserModel.findOne({ username: username.toLowerCase() });
  }

  async createUser(user: Partial<IUser>): Promise<IUser> {
    return await UserModel.create(user);
  }

  async getAll(query: any = {}): Promise<IUser[]> {
    return await UserModel.find(query);
  }

  async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
    // { new: true } guarantees Mongoose returns the newly modified object
    return await UserModel.findByIdAndUpdate(id, user, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await UserModel.findByIdAndDelete(id);
    return !!deleted;
  }

  async findMatchesForUser(skillsDesired: string[]): Promise<IUser[]> {
    return await UserModel.find({
      skillsOffered: { $in: skillsDesired },
    }).limit(20);
  }
}
