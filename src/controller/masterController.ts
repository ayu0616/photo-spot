// src/controller/masterController.ts

import { Hono } from "hono";
import { MasterRepository } from "../repositories/masterRepository";

const masterController = new Hono();
const masterRepository = new MasterRepository();

masterController.get("/prefectures", async (c) => {
  try {
    const prefectures = await masterRepository.findAllPrefectures();
    return c.json(prefectures, 200);
  } catch (error) {
    console.error("Failed to fetch prefectures:", error);
    return c.json({ error: "Failed to fetch prefectures" }, 500);
  }
});

masterController.get("/cities/:prefectureId", async (c) => {
  try {
    const prefectureId = Number(c.req.param("prefectureId"));
    if (Number.isNaN(prefectureId)) {
      return c.json({ error: "Invalid prefecture ID" }, 400);
    }
    const cities =
      await masterRepository.findCitiesByPrefectureId(prefectureId);
    return c.json(cities, 200);
  } catch (error) {
    console.error("Failed to fetch cities:", error);
    return c.json({ error: "Failed to fetch cities" }, 500);
  }
});

export default masterController;
