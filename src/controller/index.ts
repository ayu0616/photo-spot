import { Hono } from "hono";
import { compress } from "hono/compress";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

import { imageController } from "./imageController";
import postController from "./postController";
import spotController from "./spotController"; // Import the new spotController

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
  .route("/image", imageController)
  .route("/post", postController)
  .route("/spot", spotController); // Add the new spotController
