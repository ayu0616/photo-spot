import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { auth } from "@/app/api/auth/[...nextAuth]/auth";
import * as userService from "./service";

const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, "名前は必須です。")
    .max(255, "名前は255文字以内で入力してください。"),
});

export const app = new Hono()
  .put(
    "/profile",
    zValidator("json", updateUserSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: (result.error as z.ZodError).flatten() }, 400);
      }
    }),
    async (c) => {
      try {
        const session = await auth();
        const user = session?.user;
        if (!user || !user.id) {
          return c.json({ error: "Unauthorized" }, 401);
        }
        const userId = user.id;
        const { name } = c.req.valid("json");

        const updatedUser = await userService.updateUserName(userId, name);

        return c.json(updatedUser, 200);
      } catch (error) {
        console.error("ユーザー名の更新中にエラーが発生しました:", error);
        return c.json({ error: "Failed to update user name" }, 500);
      }
    },
  )
  .get("/profile", async (c) => {
    try {
      const session = await auth();
      const user = session?.user;
      if (!user || !user.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const userId = user.id;

      const userRecord = await userService.getUserById(userId);
      if (!userRecord) {
        return c.json({ error: "User not found" }, 404);
      }

      return c.json(userRecord, 200);
    } catch (error) {
      console.error("ユーザー情報の取得中にエラーが発生しました:", error);
      return c.json({ error: "Failed to get user profile" }, 500);
    }
  });
