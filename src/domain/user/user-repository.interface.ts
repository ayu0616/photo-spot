import type { UserEntity } from "./user.entity";

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | undefined>;
  updateName(id: string, name: string): Promise<UserEntity>;
}
