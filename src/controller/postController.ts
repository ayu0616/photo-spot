import { Hono } from "hono";
import { inject, injectable } from "inversify";
import { nextAuth } from "@/app/api/auth/[...nextAuth]/auth";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { TYPES } from "@/constants/types";
import { container } from "@/inversify.config";
import { PostDtoMapper } from "../dto/post-dto";
import type { PostService } from "../services/postService";

const createPostSchema = z.object({
  image: z.instanceof(File, { message: "画像ファイルが必要です。" }),
  description: z.string().min(1, { message: "説明は必須です。" }),
  spotId: z.string().optional(),
  spotName: z.string().optional(),
  cityId: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().positive(),
  ).optional(),
});

@injectable()
export class PostController {
  private readonly postService: PostService;

  public constructor(@inject(TYPES.PostService) postService: PostService) {
    this.postService = postService;
  }

  public readonly app = new Hono().post(
    "/",
    zValidator("form", createPostSchema, (result, c) => {
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

        const { image, description, spotId, spotName, cityId } =
          c.req.valid("form");

        if (!spotId && (!spotName || !cityId)) {
          return c.json({ error: "Spot information is missing." }, 400);
        }

        const postEntity = await this.postService.createPost({
          userId,
          description,
          imageFile: image,
          ...(spotId && { spotId }),
          ...(spotName && cityId && { spotName, cityId }),
        });

        const postDto = PostDtoMapper.fromEntity(postEntity);

        return c.json(postDto, 201);
      } catch (error) {
        console.error("投稿作成中にエラーが発生しました:", error);
        return c.json({ error: "Failed to create post" }, 500);
      }
    },
  );
}
