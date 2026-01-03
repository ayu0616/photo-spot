import type { UserId } from "@/features/user/domain/value-object/user-id";
import type { TripEntity } from "./trip.entity";

export interface ITripRepository {
  save(trip: TripEntity): Promise<void>;
  findById(id: string): Promise<TripEntity | null>;
  findAll(): Promise<TripEntity[]>;
  delete(id: string): Promise<void>;
  findByDate(date: string, userId: UserId): Promise<TripEntity[]>;
  findByYear(year: number, userId: UserId): Promise<TripEntity[]>;
}
