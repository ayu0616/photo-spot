import { Hono } from "hono";
import { compress } from "hono/compress";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { TYPES } from "@/constants/types";
import type { MasterController } from "@/features/master/MasterController";
import type { ImageController } from "@/features/photo/ImageController";
import type { PostController } from "@/features/post/PostController";
import type { SpotController } from "@/features/spot/SpotController";
import type { TripController } from "@/features/trip/trip.controller";
import type { UserController } from "@/features/user/UserController";
import { container } from "@/inversify.config";

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
  .route("/spot", container.get<SpotController>(TYPES.SpotController).app)
  .route("/user", container.get<UserController>(TYPES.UserController).app) // Register UserController
  .route("/trip", container.get<TripController>(TYPES.TripController).app); // Register TripController

export type AppType = typeof app;
