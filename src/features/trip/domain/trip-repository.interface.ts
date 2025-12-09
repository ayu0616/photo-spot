import type { TripEntity } from "./trip.entity";

export interface ITripRepository {
  save(trip: TripEntity): Promise<void>;
  findById(id: string): Promise<TripEntity | null>;
  findAll(): Promise<TripEntity[]>;
  delete(id: string): Promise<void>;
  findByDate(date: string): Promise<TripEntity[]>;
}
