import "reflect-metadata";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreatedAt } from "@/domain/common/value-object/created-at";
import { UpdatedAt } from "@/domain/common/value-object/updated-at";
import { TripEntity } from "@/domain/trip/trip.entity";
import { TripDescription } from "@/domain/trip/value-object/trip-description";
import { TripId } from "@/domain/trip/value-object/trip-id";
import { TripTitle } from "@/domain/trip/value-object/trip-title";
import { TripService } from "./tripService";

describe("TripService", () => {
  let tripService: TripService;
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

  it("should create a trip", async () => {
    const title = "Test Trip";
    const description = "Test Description";

    await tripService.createTrip(title, description);

    expect(mockTripRepository.save).toHaveBeenCalledTimes(1);
    const savedTrip = mockTripRepository.save.mock.calls[0][0];
    expect(savedTrip).toBeInstanceOf(TripEntity);
    expect(savedTrip.title.value).toBe(title);
    expect(savedTrip.description.value).toBe(description);
  });

  it("should get a trip by id", async () => {
    const id = "test-id";
    const trip = new TripEntity(
      new TripId(id),
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
    const id = "test-id";
    const trip = new TripEntity(
      new TripId(id),
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
    const id = "test-id";
    await tripService.deleteTrip(id);
    expect(mockTripRepository.delete).toHaveBeenCalledWith(id);
  });
});
