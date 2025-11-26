import { inject, injectable } from "inversify";
import { TYPES } from "@/constants/types";
import { CreatedAt } from "../common/common/value-object/created-at";
import { UpdatedAt } from "../common/common/value-object/updated-at";
import { UserId } from "../user/domain/value-object/user-id";
import { TripEntity } from "./domain/trip.entity";
import type { ITripRepository } from "./domain/trip-repository.interface";
import { TripDescription } from "./domain/value-object/trip-description";
import { TripId } from "./domain/value-object/trip-id";
import { TripTitle } from "./domain/value-object/trip-title";

@injectable()
export class TripService {
  private tripRepository: ITripRepository;

  constructor(@inject(TYPES.TripRepository) tripRepository: ITripRepository) {
    this.tripRepository = tripRepository;
  }

  async createTrip(
    userId: string,
    title: string,
    description: string | null,
  ): Promise<TripEntity> {
    const tripId = new TripId(crypto.randomUUID());
    const userIdVo = new UserId(userId);
    const tripTitle = new TripTitle(title);
    const tripDescription = new TripDescription(description);
    const createdAt = new CreatedAt(new Date());
    const updatedAt = new UpdatedAt(new Date());

    const trip = new TripEntity(
      tripId,
      userIdVo,
      tripTitle,
      tripDescription,
      createdAt,
      updatedAt,
    );

    await this.tripRepository.save(trip);

    return trip;
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
