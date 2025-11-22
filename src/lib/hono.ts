import { hc } from "hono/client";
import type { AppType } from "@/controller";

export const honoClient = hc<AppType>(
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
).api;
