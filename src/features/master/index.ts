import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "@/db";
import { CityMasterTable, PrefectureMasterTable } from "@/db/schema";

export const app = new Hono()
  .get("/prefectures", async (c) => {
    try {
      const prefectures = await db.select().from(PrefectureMasterTable);
      return c.json(prefectures, 200);
    } catch (error) {
      console.error("Failed to fetch prefectures:", error);
      return c.json({ error: "Failed to fetch prefectures" }, 500);
    }
  })
  .get("/cities/:prefectureId", async (c) => {
    try {
      const prefectureId = Number(c.req.param("prefectureId"));
      if (Number.isNaN(prefectureId)) {
        return c.json({ error: "Invalid prefecture ID" }, 400);
      }
      const cities = await db
        .select()
        .from(CityMasterTable)
        .where(eq(CityMasterTable.prefectureId, prefectureId));
      return c.json(cities, 200);
    } catch (error) {
      console.error("Failed to fetch cities:", error);
      return c.json({ error: "Failed to fetch cities" }, 500);
    }
  });
