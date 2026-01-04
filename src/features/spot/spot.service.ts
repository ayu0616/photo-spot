import { inject, injectable } from "inversify";
import { TYPES } from "@/constants/types";
import type { SpotRepository } from "./SpotRepository";

@injectable()
export class SpotService {
  public constructor(
    @inject(TYPES.SpotRepository)
    private readonly spotRepository: SpotRepository,
  ) {}

  public async getSpotNamesByTrips(
    tripIds: string[],
  ): Promise<Record<string, string[]>> {
    const tripMap = await this.spotRepository.getSpotNamesByTrips(tripIds);
    return Object.entries(tripMap).reduce(
      (acc, [tripId, spots]) => {
        acc[tripId] = spots.map((spot) => spot.name.value);
        return acc;
      },
      {} as Record<string, string[]>,
    );
  }
}
