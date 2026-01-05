import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { auth } from "@/app/api/auth/[...nextAuth]/auth";
import { getPostCacheTag } from "@/app/post/[id]/page";
import * as postService from "./service";

const createPostSchema = z.object({
  image: z.instanceof(File, { message: "画像ファイルが必要です。" }),
  description: z.string(),
  spotId: z.string().optional(),
  spotName: z.string().optional(),
  cityId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
});

const updatePostSchema = z.object({
  description: z.string(),
  spotId: z.string().optional(),
  spotName: z.string().optional(),
  cityId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
});

export const app = new Hono()
  .post(
    "/",
    zValidator("form", createPostSchema, (result, c) => {
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

        if (user.role !== "ADMIN") {
          return c.json(
            {
              error: "Forbidden: You do not have permission to create posts.",
            },
            403,
          );
        }

        const { image, description, spotId, spotName, cityId } =
          c.req.valid("form");

        if (!spotId && (!spotName || !cityId)) {
          return c.json({ error: "Spot information is missing." }, 400);
        }

        const post = await postService.createPost({
          userId,
          description,
          imageFile: image,
          ...(spotId && { spotId }),
          ...(spotName && cityId && { spotName, cityId }),
        });

        return c.json(post, 201);
      } catch (error) {
        console.error("投稿作成中にエラーが発生しました:", error);
        return c.json({ error: "Failed to create post" }, 500);
      }
    },
  )
  .get("/", async (c) => {
    try {
      const limit = Number(c.req.query("limit") || "10");
      const offset = Number(c.req.query("offset") || "0");

      const posts = await postService.getPosts(limit, offset);
      return c.json(posts, 200);
    } catch (error) {
      console.error("投稿一覧の取得中にエラーが発生しました:", error);
      return c.json({ error: "Failed to get posts" }, 500);
    }
  })
  .get("/all", async (c) => {
    try {
      const posts = await postService.getPosts(1000, 0);
      return c.json(posts, 200);
    } catch (error) {
      console.error("全投稿の取得中にエラーが発生しました:", error);
      return c.json({ error: "Failed to get all posts" }, 500);
    }
  })
  .get(
    "/for-trip-edit",
    zValidator(
      "query",
      z.object({
        from: z
          .string()
          .regex(/\d{4}-\d{2}-\d{2}/)
          .optional(),
        to: z
          .string()
          .regex(/\d{4}-\d{2}-\d{2}/)
          .optional(),
        tripId: z.string().min(1),
      }),
    ),
    async (c) => {
      try {
        const { from, to, tripId } = c.req.valid("query");
        const posts = await postService.queryPostsForTripEdit(
          from ? new Date(`${from}T00:00:00+09:00`) : new Date(0),
          to ? new Date(`${to}T00:00:00+09:00`) : new Date(),
          tripId,
        );
        return c.json(posts, 200);
      } catch (error) {
        console.error("投稿一覧の取得中にエラーが発生しました:", error);
        return c.json({ error: "Failed to get posts" }, 500);
      }
    },
  )
  .get("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const post = await postService.getPostById(id);

      if (!post) {
        return c.json({ error: "Post not found" }, 404);
      }

      return c.json(post, 200);
    } catch (error) {
      console.error("投稿の取得中にエラーが発生しました:", error);
      return c.json({ error: "Failed to get post" }, 500);
    }
  })
  .delete("/:id", async (c) => {
    try {
      const session = await auth();
      const user = session?.user;
      if (!user || !user.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const id = c.req.param("id");
      const post = await postService.getPostById(id);

      if (!post) {
        return c.json({ error: "Post not found" }, 404);
      }

      if (post.user.id !== user.id && user.role !== "ADMIN") {
        return c.json(
          {
            error: "Forbidden: You do not have permission to delete this post.",
          },
          403,
        );
      }

      await postService.deletePost(id);
      revalidateTag(getPostCacheTag(id), "max");
      return c.json({ message: "Post deleted successfully" }, 200);
    } catch (error) {
      console.error("投稿の削除中にエラーが発生しました:", error);
      return c.json({ error: "Failed to delete post" }, 500);
    }
  })
  .put(
    "/:id",
    zValidator("form", updatePostSchema, (result, c) => {
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

        const id = c.req.param("id");
        const { description, spotId, spotName, cityId } = c.req.valid("form");

        const updatedPost = await postService.updatePost({
          id,
          userId: user.id,
          description,
          spotId,
          spotName,
          cityId,
        });

        revalidateTag(getPostCacheTag(id), "max");
        return c.json(updatedPost, 200);
      } catch (error) {
        console.error("投稿の更新中にエラーが発生しました:", error);
        if (error instanceof Error && error.message === "Unauthorized") {
          return c.json({ error: "Forbidden" }, 403);
        }
        return c.json({ error: "Failed to update post" }, 500);
      }
    },
  )
  .put(
    "/:id/set-travel",
    zValidator("param", z.object({ id: z.string().min(1) })),
    zValidator("json", z.object({ tripId: z.string().min(1).nullable() })),
    async (c) => {
      try {
        const session = await auth();
        const user = session?.user;
        if (!user || !user.id) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const id = c.req.param("id");
        const { tripId } = c.req.valid("json");

        const updatedPost = await postService.setTravel({
          id,
          userId: user.id,
          tripId,
        });

        revalidateTag(getPostCacheTag(id), "max");
        return c.json(updatedPost, 200);
      } catch (error) {
        console.error("投稿の更新中にエラーが発生しました:", error);
        if (error instanceof Error && error.message === "Unauthorized") {
          return c.json({ error: "Forbidden" }, 403);
        }
        return c.json({ error: "Failed to update post" }, 500);
      }
    },
  );
