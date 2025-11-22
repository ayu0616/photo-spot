import { inject, injectable } from "inversify";
import { TYPES } from "@/constants/types";
import { CreatedAt } from "@/domain/common/value-object/created-at";
import { UpdatedAt } from "@/domain/common/value-object/updated-at";
import { TripEntity } from "@/domain/trip/trip.entity";
import type { ITripRepository } from "@/domain/trip/trip-repository.interface";
import { TripDescription } from "@/domain/trip/value-object/trip-description";
import { TripId } from "@/domain/trip/value-object/trip-id";
import { TripTitle } from "@/domain/trip/value-object/trip-title";

@injectable()
export class TripService {
  constructor(
    @inject(TYPES.TripRepository) private tripRepository: ITripRepository,
  ) {}

  async createTrip(title: string, description: string | null): Promise<void> {
    const trip = new TripEntity(
      TripId.generate(),
      new TripTitle(title),
      new TripDescription(description),
      new CreatedAt(new Date()),
      new UpdatedAt(new Date()),
    );
    await this.tripRepository.save(trip);
  }

  async updateTrip(
    id: string,
    title: string,
    description: string | null,
  ): Promise<void> {
    const trip = await this.tripRepository.findById(id);
    if (!trip) {
      throw new Error("Trip not found");
    }

    trip.updateTitle(new TripTitle(title));
    trip.updateDescription(new TripDescription(description));

    await this.tripRepository.save(trip);
  }

  async deleteTrip(id: string): Promise<void> {
    await this.tripRepository.delete(id);
  }

  async getTrip(id: string): Promise<TripEntity | null> {
    return await this.tripRepository.findById(id);
  }

  async getAllTrips(): Promise<TripEntity[]> {
    return await this.tripRepository.findAll();
  }
}
