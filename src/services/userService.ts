import { inject, injectable } from "inversify";
import { TYPES } from "@/constants/types";
import type { UserEntity } from "@/domain/user/user.entity";
import type { IUserRepository } from "@/repositories/userRepository";

export interface IUserService {
  updateUserName(userId: string, name: string): Promise<UserEntity>;
  getUserById(userId: string): Promise<UserEntity | undefined>;
}

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  public async updateUserName(
    userId: string,
    name: string,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }
    return this.userRepository.updateName(userId, name);
  }

  public async getUserById(userId: string): Promise<UserEntity | undefined> {
    return this.userRepository.findById(userId);
  }
}
