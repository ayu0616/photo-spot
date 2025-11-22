import "reflect-metadata";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { TripsTable } from "@/db/schema";
import { CreatedAt } from "@/domain/common/value-object/created-at";
import { UpdatedAt } from "@/domain/common/value-object/updated-at";
import { TripEntity } from "@/domain/trip/trip.entity";
import { TripDescription } from "@/domain/trip/value-object/trip-description";
import { TripId } from "@/domain/trip/value-object/trip-id";
import { TripTitle } from "@/domain/trip/value-object/trip-title";
import { TripRepository } from "./tripRepository";

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

  it("should save a trip", async () => {
    const trip = new TripEntity(
      new TripId("test-id"),
      new TripTitle("Test Trip"),
      new TripDescription("Test Description"),
      new CreatedAt(new Date()),
      new UpdatedAt(new Date()),
    );

    await tripRepository.save(trip);

    expect(db.insert).toHaveBeenCalledWith(TripsTable);
  });

  it("should find a trip by id", async () => {
    const id = "test-id";
    const mockDbTrip = {
      id: "test-id",
      title: "Test Trip",
      description: "Test Description",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (db.query.TripsTable.findFirst as any).mockResolvedValue(mockDbTrip);

    const result = await tripRepository.findById(id);

    expect(db.query.TripsTable.findFirst).toHaveBeenCalled();
    expect(result).toBeInstanceOf(TripEntity);
    expect(result?.id.value).toBe(id);
  });

  it("should delete a trip", async () => {
    const id = "test-id";
    await tripRepository.delete(id);
    expect(db.delete).toHaveBeenCalledWith(TripsTable);
  });
});
