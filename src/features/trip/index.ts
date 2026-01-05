import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { auth } from "@/app/api/auth/[...nextAuth]/auth";
import { getTripCacheTag } from "@/app/trip/[id]/page";
import * as postService from "@/features/post/service";
import * as spotService from "@/features/spot/service";
import * as tripService from "./service";

const createTripSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(255).optional(),
  startedAt: z
    .string()
    .regex(/\d{4}-\d{2}-\d{2}/)
    .optional(),
  endedAt: z
    .string()
    .regex(/\d{4}-\d{2}-\d{2}/)
    .optional(),
});

const updateTripSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(255).optional(),
  postIds: z.array(z.string()).optional(),
  startedAt: z
    .string()
    .regex(/\d{4}-\d{2}-\d{2}/)
    .optional(),
  endedAt: z
    .string()
    .regex(/\d{4}-\d{2}-\d{2}/)
    .optional(),
});

export const app = new Hono()
  .get("/", async (c) => {
    try {
      const trips = await tripService.getAllTrips();
      return c.json(trips, 200);
    } catch (error) {
      console.error("Failed to get trips:", error);
      return c.json({ error: "Failed to get trips" }, 500);
    }
  })
  .get(
    "/get-by-date",
    zValidator(
      "query",
      z.object({
        date: z.string().regex(/\d{4}-\d{2}-\d{2}/),
      }),
    ),
    async (c) => {
      try {
        const { date } = c.req.valid("query");
        const session = await auth();
        const user = session?.user;
        if (!user || !user.id) {
          return c.json({ error: "Unauthorized" }, 401);
        }
        const trips = await tripService.getTripByDate(date, user.id);
        return c.json(trips, 200);
      } catch (error) {
        console.error("Failed to get trip by date:", error);
        return c.json({ error: "Failed to get trip by date" }, 500);
      }
    },
  )
  .get(
    "/get-by-year",
    zValidator("query", z.object({ year: z.coerce.number().int().positive() })),
    async (c) => {
      try {
        const { year } = c.req.valid("query");
        const session = await auth();
        const user = session?.user;
        if (!user || !user.id) {
          return c.json({ error: "Unauthorized" }, 401);
        }
        const trips = await tripService.getTripByYear(year, user.id);
        const tripIds = trips.map((trip) => trip.id);
        const spotNames = await spotService.getSpotNamesByTrips(tripIds);

        return c.json(
          trips.map((trip) => ({
            ...trip,
            spotNames: spotNames[trip.id] ?? [],
          })),
          200,
        );
      } catch (error) {
        console.error("Failed to get trip by year:", error);
        return c.json({ error: "Failed to get trip by year" }, 500);
      }
    },
  )
  .get("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const trip = await tripService.getTrip(id);
      if (!trip) {
        return c.json({ error: "Trip not found" }, 404);
      }

      const posts = await postService.getPostsByTripId(id);

      return c.json(
        {
          ...trip,
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
      const session = await auth();
      const user = session?.user;
      if (!user || user.role !== "ADMIN") {
        return c.json({ error: "Forbidden" }, 403);
      }

      const { title, description, startedAt, endedAt } = c.req.valid("json");
      if (!user.id) {
        return c.json({ error: "User ID is missing" }, 400);
      }

      await tripService.createTrip({
        userId: user.id,
        title,
        description: description ?? null,
        startedAt: startedAt ?? null,
        endedAt: endedAt ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return c.json({ message: "Trip created" }, 201);
    } catch (error) {
      console.error("Failed to create trip:", error);
      return c.json({ error: "Failed to create trip" }, 500);
    }
  })
  .put("/:id", zValidator("json", updateTripSchema), async (c) => {
    try {
      const session = await auth();
      const user = session?.user;
      if (!user || !user.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const id = c.req.param("id");

      if (user.role !== "ADMIN") {
        const trip = await tripService.getTrip(id);
        if (!trip) {
          return c.json({ error: "Trip not found" }, 404);
        }
        if (trip.userId !== user.id) {
          return c.json({ error: "Forbidden" }, 403);
        }
      }

      const { title, description, postIds, startedAt, endedAt } =
        c.req.valid("json");

      await tripService.updateTrip(id, {
        title,
        description: description ?? null,
        startedAt: startedAt ?? null,
        endedAt: endedAt ?? null,
      });

      if (postIds) {
        await postService.updatePostsTrip(id, postIds);
      }

      revalidateTag(getTripCacheTag(id), "max");
      return c.json({ message: "Trip updated" }, 200);
    } catch (error) {
      console.error("Failed to update trip:", error);
      return c.json({ error: "Failed to update trip" }, 500);
    }
  })
  .delete("/:id", async (c) => {
    try {
      const session = await auth();
      const user = session?.user;
      if (!user || !user.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const id = c.req.param("id");

      if (user.role !== "ADMIN") {
        const trip = await tripService.getTrip(id);
        if (!trip) {
          return c.json({ error: "Trip not found" }, 404);
        }
        if (trip.userId !== user.id) {
          return c.json({ error: "Forbidden" }, 403);
        }
      }

      await tripService.deleteTrip(id);
      revalidateTag(getTripCacheTag(id), "max");
      return c.json({ message: "Trip deleted" }, 200);
    } catch (error) {
      console.error("Failed to delete trip:", error);
      return c.json({ error: "Failed to delete trip" }, 500);
    }
  });
