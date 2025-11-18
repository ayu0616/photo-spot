import { Hono } from "hono";
import { inject, injectable } from "inversify";
import { nextAuth } from "@/app/api/auth/[...nextAuth]/auth";
import { TYPES } from "@/constants/types";
import { PostDtoMapper } from "../dto/post-dto";
import type { PostService } from "../services/postService";

@injectable()
export class PostController {
  private readonly postService: PostService;

  public constructor(@inject(TYPES.PostService) postService: PostService) {
    this.postService = postService;
  }

  public readonly app = new Hono().post("/", async (c) => {
    try {
      const auth = await nextAuth.auth();
      const user = auth?.user;
      if (!user || !user.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const userId = user.id;

      const formData = await c.req.formData();
      const imageFile = formData.get("image") as File;
      const description = formData.get("description") as string;

      // Spot information can be either spotId or spotName + cityId
      const spotId = formData.get("spotId") as string | null;
      const spotName = formData.get("spotName") as string | null;
      const cityId = formData.get("cityId")
        ? Number(formData.get("cityId"))
        : null;

      if (!imageFile || !description || !userId) {
        return c.json({ error: "Missing required fields" }, 400);
      }

      if (!spotId && (!spotName || !cityId)) {
        return c.json({ error: "Spot information is missing." }, 400);
      }

      // 1. 画像をGCSにアップロードし、EXIFデータを抽出
      // This logic should ideally be moved to a service or handled by the PostService itself
      // For now, we'll assume postService.createPost handles image upload internally or expects a URL
      // For this refactor, we'll pass the imageFile directly to the service.
      // The service will then use ImageStorageService internally.

      // 2. PostServiceを使って投稿を作成
      const postEntity = await this.postService.createPost({
        userId,
        description,
        imageFile, // Pass imageFile directly
        ...(spotId && { spotId }),
        ...(spotName && cityId && { spotName, cityId }),
      });

      // 3. DTOに変換して返す
      const postDto = PostDtoMapper.fromEntity(postEntity);

      return c.json(postDto, 201);
    } catch (error) {
      console.error("投稿作成中にエラーが発生しました:", error);
      return c.json({ error: "Failed to create post" }, 500);
    }
  });
}
