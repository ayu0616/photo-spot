import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { inject, injectable } from "inversify";
import { z } from "zod";
import { nextAuth } from "@/app/api/auth/[...nextAuth]/auth";
import { TYPES } from "@/constants/types";
import { UserDtoMapper } from "@/features/user/UserDto";
import type { UserService } from "@/features/user/UserService";

const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, "名前は必須です。")
    .max(255, "名前は255文字以内で入力してください。"),
});

@injectable()
export class UserController {
  private readonly userService: UserService;

  public constructor(@inject(TYPES.UserService) userService: UserService) {
    this.userService = userService;
  }

  public readonly app = new Hono()
    .put(
      "/profile",
      zValidator("json", updateUserSchema, (result, c) => {
        if (!result.success) {
          return c.json({ error: (result.error as z.ZodError).flatten() }, 400);
        }
      }),
      async (c) => {
        try {
          const auth = await nextAuth.auth();
          const user = auth?.user;
          if (!user || !user.id) {
            return c.json({ error: "Unauthorized" }, 401);
          }
          const userId = user.id;
          const { name } = c.req.valid("json");

          const updatedUserEntity = await this.userService.updateUserName(
            userId,
            name,
          );
          const userDto = UserDtoMapper.fromEntity(updatedUserEntity);

          return c.json(userDto, 200);
        } catch (error) {
          console.error("ユーザー名の更新中にエラーが発生しました:", error);
          return c.json({ error: "Failed to update user name" }, 500);
        }
      },
    )
    .get("/profile", async (c) => {
      try {
        const auth = await nextAuth.auth();
        const user = auth?.user;
        if (!user || !user.id) {
          return c.json({ error: "Unauthorized" }, 401);
        }
        const userId = user.id;

        const userEntity = await this.userService.getUserById(userId);
        if (!userEntity) {
          return c.json({ error: "User not found" }, 404);
        }
        const userDto = UserDtoMapper.fromEntity(userEntity);

        return c.json(userDto, 200);
      } catch (error) {
        console.error("ユーザー情報の取得中にエラーが発生しました:", error);
        return c.json({ error: "Failed to get user profile" }, 500);
      }
    });
}
