import { Hono } from "hono";
import * as spotService from "./service";

export const app = new Hono().get("/", async (c) => {
  try {
    const spots = await spotService.getAllSpots();
    return c.json(spots, 200);
  } catch (error) {
    console.error("Failed to fetch spots:", error);
    return c.json({ error: "Failed to fetch spots" }, 500);
  }
});
