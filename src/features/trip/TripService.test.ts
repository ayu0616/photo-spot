import "reflect-metadata";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TripEntity } from "../trip/domain/trip.entity";
import { TripDescription } from "../trip/domain/value-object/trip-description";
import { TripTitle } from "../trip/domain/value-object/trip-title";
import { UserId } from "../user/domain/value-object/user-id";
import { TripEndedAt } from "./domain/value-object/trip-ended-at";
import { TripStartedAt } from "./domain/value-object/trip-started-at";
import { TripService } from "./TripService";

describe("TripService", () => {
  let tripService: TripService;
  // biome-ignore lint/suspicious/noExplicitAny: テストのため
  let mockTripRepository: any;

  beforeEach(() => {
    mockTripRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
    };
    tripService = new TripService(mockTripRepository);
  });

  // ...

  it("should create a trip", async () => {
    const userId = crypto.randomUUID();
    const title = "Test Trip";
    const description = "Test Description";
    const startedAt = "2025-12-01";
    const endedAt = "2025-12-31";

    await tripService.createTrip(
      userId,
      title,
      description,
      startedAt,
      endedAt,
    );

    expect(mockTripRepository.save).toHaveBeenCalledTimes(1);
    const savedTrip = mockTripRepository.save.mock.calls[0][0];
    expect(savedTrip).toBeInstanceOf(TripEntity);
    expect(savedTrip.userId.value).toBe(userId);
    expect(savedTrip.title.value).toBe(title);
    expect(savedTrip.description.value).toBe(description);
  });

  it("should get a trip by id", async () => {
    const trip = TripEntity.create(
      UserId.create(),
      new TripTitle("Test Trip"),
      new TripDescription("Test Description"),
      new TripStartedAt("2025-12-01"),
      new TripEndedAt("2025-12-31"),
    );
    mockTripRepository.findById.mockResolvedValue(trip);

    const result = await tripService.getTrip(trip.id.value);

    expect(mockTripRepository.findById).toHaveBeenCalledWith(trip.id.value);
    expect(result).toBe(trip);
  });

  it("should update a trip", async () => {
    const trip = TripEntity.create(
      UserId.create(),
      new TripTitle("Old Title"),
      new TripDescription("Old Description"),
      new TripStartedAt("2025-12-01"),
      new TripEndedAt("2025-12-31"),
    );
    mockTripRepository.findById.mockResolvedValue(trip);

    await tripService.updateTrip(
      trip.id.value,
      "New Title",
      "New Description",
      "2025-12-01",
      "2025-12-31",
    );

    expect(mockTripRepository.save).toHaveBeenCalledTimes(1);
    const savedTrip = mockTripRepository.save.mock.calls[0][0];
    expect(savedTrip.title.value).toBe("New Title");
    expect(savedTrip.description.value).toBe("New Description");
  });

  it("should delete a trip", async () => {
    const trip = TripEntity.create(
      UserId.create(),
      new TripTitle("Test Trip"),
      new TripDescription("Test Description"),
      new TripStartedAt("2025-12-01"),
      new TripEndedAt("2025-12-31"),
    );
    mockTripRepository.findById.mockResolvedValue(trip);
    await tripService.deleteTrip(trip.id.value);
    expect(mockTripRepository.delete).toHaveBeenCalledWith(trip.id.value);
  });
});
