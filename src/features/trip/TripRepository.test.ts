import "reflect-metadata";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { db } from "@/db";
import { TripsTable } from "@/db/schema";
import { UserId } from "@/features/user/domain/value-object/user-id";
import { CreatedAt } from "../common/common/value-object/created-at";
import { UpdatedAt } from "../common/common/value-object/updated-at";
import { TripEntity } from "../trip/domain/trip.entity";
import { TripDescription } from "../trip/domain/value-object/trip-description";
import { TripId } from "../trip/domain/value-object/trip-id";
import { TripTitle } from "../trip/domain/value-object/trip-title";
import { TripRepository } from "./TripRepository";

// Mock db
vi.mock("@/db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        onConflictDoUpdate: vi.fn(),
      })),
    })),
    query: {
      TripsTable: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
  },
}));

describe("TripRepository", () => {
  let tripRepository: TripRepository;

  beforeEach(() => {
    tripRepository = new TripRepository();
    vi.clearAllMocks();
  });

  // ...

  it("should save a trip", async () => {
    const trip = new TripEntity(
      new TripId(crypto.randomUUID()),
      new UserId(crypto.randomUUID()),
      new TripTitle("Test Trip"),
      new TripDescription("Test Description"),
      new CreatedAt(new Date()),
      new UpdatedAt(new Date()),
    );

    await tripRepository.save(trip);

    expect(db.insert).toHaveBeenCalledWith(TripsTable);
  });

  it("should find a trip by id", async () => {
    const id = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const mockDbTrip = {
      id: id,
      userId: userId,
      title: "Test Trip",
      description: "Test Description",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (db.query.TripsTable.findFirst as Mock).mockResolvedValue(mockDbTrip);

    const result = await tripRepository.findById(id);

    expect(db.query.TripsTable.findFirst).toHaveBeenCalled();
    expect(result).toBeInstanceOf(TripEntity);
    expect(result?.id.value).toBe(id);
  });

  it("should delete a trip", async () => {
    const id = crypto.randomUUID();
    await tripRepository.delete(id);
    expect(db.delete).toHaveBeenCalledWith(TripsTable);
  });
});
