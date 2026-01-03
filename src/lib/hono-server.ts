"use server";

import { hc } from "hono/client";
import { type AppType, app } from "@/api";

export const honoServerClient = hc<AppType>("/", {
  fetch: app.request,
}).api;
