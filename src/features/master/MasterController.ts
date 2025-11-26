import { Hono } from "hono";
import { inject, injectable } from "inversify";
import { TYPES } from "@/constants/types";
import type { MasterRepository } from "./MasterRepository";

@injectable()
export class MasterController {
  private readonly masterRepository: MasterRepository;

  public constructor(
    @inject(TYPES.MasterRepository) masterRepository: MasterRepository,
  ) {
    this.masterRepository = masterRepository;
  }

  public readonly app = new Hono()
    .get("/prefectures", async (c) => {
      try {
        const prefectures = await this.masterRepository.findAllPrefectures();
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
        const cities =
          await this.masterRepository.findCitiesByPrefectureId(prefectureId);
        return c.json(cities, 200);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
        return c.json({ error: "Failed to fetch cities" }, 500);
      }
    });
}
