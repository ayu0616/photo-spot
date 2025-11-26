import "reflect-metadata";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreatedAt } from "../common/common/value-object/created-at";
import { UpdatedAt } from "../common/common/value-object/updated-at";
import { TripEntity } from "../trip/domain/trip.entity";
import { TripDescription } from "../trip/domain/value-object/trip-description";
import { TripId } from "../trip/domain/value-object/trip-id";
import { TripTitle } from "../trip/domain/value-object/trip-title";
import { UserId } from "../user/domain/value-object/user-id";
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

    await tripService.createTrip(userId, title, description);

    expect(mockTripRepository.save).toHaveBeenCalledTimes(1);
    const savedTrip = mockTripRepository.save.mock.calls[0][0];
    expect(savedTrip).toBeInstanceOf(TripEntity);
    expect(savedTrip.userId.value).toBe(userId);
    expect(savedTrip.title.value).toBe(title);
    expect(savedTrip.description.value).toBe(description);
  });

  it("should get a trip by id", async () => {
    const id = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const trip = new TripEntity(
      new TripId(id),
      new UserId(userId),
      new TripTitle("Test Trip"),
      new TripDescription("Test Description"),
      new CreatedAt(new Date()),
      new UpdatedAt(new Date()),
    );
    mockTripRepository.findById.mockResolvedValue(trip);

    const result = await tripService.getTrip(id);

    expect(mockTripRepository.findById).toHaveBeenCalledWith(id);
    expect(result).toBe(trip);
  });

  it("should update a trip", async () => {
    const id = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const trip = new TripEntity(
      new TripId(id),
      new UserId(userId),
      new TripTitle("Old Title"),
      new TripDescription("Old Description"),
      new CreatedAt(new Date()),
      new UpdatedAt(new Date()),
    );
    mockTripRepository.findById.mockResolvedValue(trip);

    await tripService.updateTrip(id, "New Title", "New Description");

    expect(mockTripRepository.save).toHaveBeenCalledTimes(1);
    const savedTrip = mockTripRepository.save.mock.calls[0][0];
    expect(savedTrip.title.value).toBe("New Title");
    expect(savedTrip.description.value).toBe("New Description");
  });

  it("should delete a trip", async () => {
    const id = crypto.randomUUID();
    await tripService.deleteTrip(id);
    expect(mockTripRepository.delete).toHaveBeenCalledWith(id);
  });
});
