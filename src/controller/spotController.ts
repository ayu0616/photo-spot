// src/controller/spotController.ts

import { Hono } from "hono";
import { SpotDtoMapper } from "../dto/spot-dto";
import { SpotRepository } from "../repositories/spotRepository";

const spotController = new Hono();
const spotRepository = new SpotRepository();

spotController.get("/", async (c) => {
  try {
    // In a real application, you might want to add pagination, filtering, etc.
    // For now, we'll fetch all spots.
    const spots = await spotRepository.findAll(); // Assuming a findAll method exists or will be added

    const spotDtos = spots.map((spot) => SpotDtoMapper.fromEntity(spot));
    return c.json(spotDtos, 200);
  } catch (error) {
    console.error("Failed to fetch spots:", error);
    return c.json({ error: "Failed to fetch spots" }, 500);
  }
});

export default spotController;
