import { hc } from "hono/client";
import type { AppType } from "@/controller";

export const honoClient = hc<AppType>("/").api;
