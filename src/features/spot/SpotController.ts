import { Hono } from "hono";
import { inject, injectable } from "inversify";
import { TYPES } from "@/constants/types";
import { SpotDtoMapper } from "./SpotDto";
import type { SpotRepository } from "./SpotRepository";

@injectable()
export class SpotController {
  private readonly spotRepository: SpotRepository;

  public constructor(
    @inject(TYPES.SpotRepository) spotRepository: SpotRepository,
  ) {
    this.spotRepository = spotRepository;
  }

  public readonly app = new Hono().get("/", async (c) => {
    try {
      // In a real application, you might want to add pagination, filtering, etc.
      // For now, we'll fetch all spots.
      const spots = await this.spotRepository.findAll(); // Assuming a findAll method exists or will be added

      const spotDtos = spots.map((spot) =>
        SpotDtoMapper.fromEntity(spot, spot.prefectureId),
      );
      return c.json(spotDtos, 200);
    } catch (error) {
      console.error("Failed to fetch spots:", error);
      return c.json({ error: "Failed to fetch spots" }, 500);
    }
  });
}
