import { Hono } from "hono";
import { compress } from "hono/compress";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

import { app as masterApp } from "@/features/master";
import { app as imageApp } from "@/features/photo";
import { app as postApp } from "@/features/post";
import { app as spotApp } from "@/features/spot";
import { app as tripApp } from "@/features/trip";
import { app as userApp } from "@/features/user";

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
  .route("/image", imageApp)
  .route("/master", masterApp)
  .route("/post", postApp)
  .route("/spot", spotApp)
  .route("/user", userApp)
  .route("/trip", tripApp);

export type AppType = typeof app;
