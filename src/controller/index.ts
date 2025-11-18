import { Hono } from "hono";
import { compress } from "hono/compress";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { TYPES } from "@/constants/types";
import { container } from "@/inversify.config";
import type { ImageController } from "./imageController";
import type { MasterController } from "./masterController";
import type { PostController } from "./postController";
import type { SpotController } from "./spotController"; // Import the new SpotController class // Import the new PostController class

export const app = new Hono()
  .basePath("/api")
  .use(
    secureHeaders({
      strictTransportSecurity: "max-age=63072000; includeSubDomains; preload",
      xXssProtection: "1",
    }),
  )
  .use(logger())
  .use(compress())
  .use(csrf())
  .onError((err, c) => {
    console.error(err);
    return c.json({ error: err.message }, 500);
  })
  .route("/image", container.get<ImageController>(TYPES.ImageController).app)
  .route("/master", container.get<MasterController>(TYPES.MasterController).app)
  .route("/post", container.get<PostController>(TYPES.PostController).app)
  .route("/spot", container.get<SpotController>(TYPES.SpotController).app);

export type AppType = typeof app;
