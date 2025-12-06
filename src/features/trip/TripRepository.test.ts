import "reflect-metadata";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { db } from "@/db";
import { TripsTable } from "@/db/schema";
import { UserId } from "@/features/user/domain/value-object/user-id";
import { TripEntity } from "../trip/domain/trip.entity";
import { TripDescription } from "../trip/domain/value-object/trip-description";
import { TripTitle } from "../trip/domain/value-object/trip-title";
import { TripEndedAt } from "./domain/value-object/trip-ended-at";
import { TripStartedAt } from "./domain/value-object/trip-started-at";
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
    const trip = TripEntity.create(
      new UserId(crypto.randomUUID()),
      new TripTitle("Test Trip"),
      new TripDescription("Test Description"),
      new TripStartedAt("2025-12-01"),
      new TripEndedAt("2025-12-31"),
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
      startedAt: "2025-12-01",
      endedAt: "2025-12-31",
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
