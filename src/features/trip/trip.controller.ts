import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { inject, injectable } from "inversify";
import { z } from "zod";
import { nextAuth } from "@/app/api/auth/[...nextAuth]/auth";
import { TYPES } from "@/constants/types";
import type { PostService } from "@/features/post/PostService";
import type { TripService } from "@/features/trip/TripService";

const createTripSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(255).optional(),
});

const updateTripSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(255).optional(),
  postIds: z.array(z.string()).optional(),
});

@injectable()
export class TripController {
  private readonly tripService: TripService;
  private readonly postService: PostService;

  public constructor(
    @inject(TYPES.TripService) tripService: TripService,
    @inject(TYPES.PostService) postService: PostService,
  ) {
    this.tripService = tripService;
    this.postService = postService;
  }

  public readonly app = new Hono()
    .get("/", async (c) => {
      try {
        const trips = await this.tripService.getAllTrips();
        return c.json(
          trips.map((trip) => ({
            id: trip.id.value,
            title: trip.title.value,
            description: trip.description.value,
            createdAt: trip.createdAt.value,
            updatedAt: trip.updatedAt.value,
          })),
          200,
        );
      } catch (error) {
        console.error("Failed to get trips:", error);
        return c.json({ error: "Failed to get trips" }, 500);
      }
    })
    .get("/:id", async (c) => {
      try {
        const id = c.req.param("id");
        const trip = await this.tripService.getTrip(id);
        if (!trip) {
          return c.json({ error: "Trip not found" }, 404);
        }

        const posts = await this.postService.getPostsByTripId(id);

        return c.json(
          {
            id: trip.id.value,
            title: trip.title.value,
            description: trip.description.value,
            createdAt: trip.createdAt.value,
            updatedAt: trip.updatedAt.value,
            posts: posts,
          },
          200,
        );
      } catch (error) {
        console.error("Failed to get trip:", error);
        return c.json({ error: "Failed to get trip" }, 500);
      }
    })
    .post("/", zValidator("json", createTripSchema), async (c) => {
      try {
        const auth = await nextAuth.auth();
        const user = auth?.user;
        if (!user || user.role !== "ADMIN") {
          return c.json({ error: "Forbidden" }, 403);
        }

        const { title, description } = c.req.valid("json");
        if (!user.id) {
          return c.json({ error: "User ID is missing" }, 400);
        }
        await this.tripService.createTrip(user.id, title, description ?? null);
        return c.json({ message: "Trip created" }, 201);
      } catch (error) {
        console.error("Failed to create trip:", error);
        return c.json({ error: "Failed to create trip" }, 500);
      }
    })
    .put("/:id", zValidator("json", updateTripSchema), async (c) => {
      try {
        const auth = await nextAuth.auth();
        const user = auth?.user;
        if (!user || user.role !== "ADMIN") {
          return c.json({ error: "Forbidden" }, 403);
        }

        const id = c.req.param("id");
        const { title, description, postIds } = c.req.valid("json");
        await this.tripService.updateTrip(id, title, description ?? null);

        if (postIds) {
          await this.postService.updatePostsTrip(id, postIds);
        }

        return c.json({ message: "Trip updated" }, 200);
      } catch (error) {
        console.error("Failed to update trip:", error);
        return c.json({ error: "Failed to update trip" }, 500);
      }
    })
    .delete("/:id", async (c) => {
      try {
        const auth = await nextAuth.auth();
        const user = auth?.user;
        if (!user || user.role !== "ADMIN") {
          return c.json({ error: "Forbidden" }, 403);
        }

        const id = c.req.param("id");
        await this.tripService.deleteTrip(id);
        return c.json({ message: "Trip deleted" }, 200);
      } catch (error) {
        console.error("Failed to delete trip:", error);
        return c.json({ error: "Failed to delete trip" }, 500);
      }
    });
}
