import { initAuthConfig } from "@hono/auth-js";
import { Hono } from "hono";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { handle } from "hono/vercel";
import { NextResponse } from "next/server";
import { nextAuth, nextAuthConfig } from "./app/api/auth/[...nextAuth]/auth";

const app = new Hono()
  .use(
    secureHeaders({
      strictTransportSecurity: "max-age=63072000; includeSubDomains; preload",
      xXssProtection: "1",
    }),
  )
  .use(logger())
  .use(csrf())
  .use(
    "*",
    initAuthConfig(() => nextAuthConfig),
  )
  .onError((err, c) => {
    console.error(err);
    const req = c.req.raw;
    return NextResponse.next({
      request: req,
    });
  })
  //   .use((async (c, next) => {
  //     const allowedPathPrefixList = ["/api/auth", "/login", "/_next"];
  //     if (allowedPathPrefixList.some((path) => c.req.path.startsWith(path))) {
  //       return next();
  //     }

  //     const auth = await nextAuth.auth();
  //     if (!auth?.user) {
  //       if (c.req.path.startsWith("/api")) {
  //         return c.json({ error: "Unauthorized" }, 401);
  //       }
  //       const url = new URL(c.req.url);
  //       url.pathname = "/login";
  //       return c.redirect(url);
  //     }
  //     return next();
  //   }) as MiddlewareHandler)
  .use("/upload", async (c, next) => {
    const auth = await nextAuth.auth();
    if (!auth?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    return next();
  })
  .all("*", async (c) => {
    const req = c.req.raw;
    return NextResponse.next({
      request: req,
    });
  });

export default handle(app);

export const config = {
  matcher: [
    // Exclude API routes, static files, image optimizations, and .png files
    "/((?!api|_next/static|_next/image|.*\\.png$).*)",
  ],
};
