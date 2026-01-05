import type { InferSelectModel } from "drizzle-orm";
import { and, asc, eq, gte, inArray, isNull, lt, or } from "drizzle-orm";
import { db } from "@/db";
import { PhotosTable, PostsTable, SpotsTable, TripsTable } from "@/db/schema";
import * as imageService from "@/features/photo/image.service";

export type Post = InferSelectModel<typeof PostsTable>;

export async function createPost(params: {
  userId: string;
  description: string;
  imageFile: File;
  spotId?: string;
  spotName?: string;
  cityId?: number;
}): Promise<Post> {
  // Upload image first
  const { url, exifData } = await imageService.uploadImage(params.imageFile);

  return await db.transaction(async (tx) => {
    let spotId = params.spotId;

    if (!spotId) {
      if (params.spotName && params.cityId) {
        const [existingSpot] = await tx
          .select()
          .from(SpotsTable)
          .where(
            and(
              eq(SpotsTable.name, params.spotName),
              eq(SpotsTable.cityId, params.cityId),
            ),
          );

        if (existingSpot) {
          spotId = existingSpot.id;
        } else {
          const [newSpot] = await tx
            .insert(SpotsTable)
            .values({
              name: params.spotName,
              cityId: params.cityId,
            })
            .returning();
          spotId = newSpot.id;
        }
      } else {
        throw new Error("Spot information is missing.");
      }
    } else {
      const [found] = await tx
        .select()
        .from(SpotsTable)
        .where(eq(SpotsTable.id, spotId));
      if (!found) throw new Error("Selected spot not found.");
    }

    const [photo] = await tx
      .insert(PhotosTable)
      .values({
        url,
        takenAt: exifData.takenAt,
        cameraMake: exifData.cameraMake,
        cameraModel: exifData.cameraModel,
        latitude: exifData.latitude?.toString(),
        longitude: exifData.longitude?.toString(),
        orientation: exifData.orientation,
        iso: exifData.iso,
        lensMake: exifData.lensMake,
        lensModel: exifData.lensModel,
        lensSerial: exifData.lensSerial,
        focalLength: exifData.focalLength,
        focalLength35mm: exifData.focalLength35mm,
        aperture: exifData.aperture,
        shutterSpeed: exifData.shutterSpeed,
      })
      .returning();

    const [post] = await tx
      .insert(PostsTable)
      .values({
        userId: params.userId,
        description: params.description,
        spotId: spotId!,
        photoId: photo.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return post;
  });
}

export async function getPosts(limit: number, offset: number) {
  return await db.query.PostsTable.findMany({
    limit: limit,
    offset: offset,
    orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
      spot: {
        columns: {
          id: true,
          name: true,
        },
        with: {
          city: {
            columns: {
              id: true,
              name: true,
            },
            with: {
              prefecture: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      photo: {
        columns: {
          id: true,
          url: true,
          takenAt: true,
        },
      },
      trip: {
        columns: {
          id: true,
          title: true,
        },
      },
    },
  });
}

export async function getPostById(id: string) {
  const post = await db.query.PostsTable.findFirst({
    where: eq(PostsTable.id, id),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
      spot: {
        columns: {
          id: true,
          name: true,
        },
        with: {
          city: {
            columns: {
              id: true,
              name: true,
            },
            with: {
              prefecture: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      photo: {
        columns: {
          id: true,
          url: true,
          takenAt: true,
          cameraMake: true,
          cameraModel: true,
          latitude: true,
          longitude: true,
          orientation: true,
          iso: true,
          lensMake: true,
          lensModel: true,
          lensSerial: true,
          focalLength: true,
          focalLength35mm: true,
          aperture: true,
          shutterSpeed: true,
        },
      },
      trip: {
        columns: {
          id: true,
          title: true,
        },
      },
    },
  });
  return post ?? null;
}

export async function getPostsByTripId(tripId: string) {
  const posts = await db.query.PostsTable.findMany({
    where: eq(PostsTable.tripId, tripId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
      spot: {
        columns: {
          id: true,
          name: true,
        },
        with: {
          city: {
            columns: {
              id: true,
              name: true,
            },
            with: {
              prefecture: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      photo: {
        columns: {
          id: true,
          url: true,
          takenAt: true,
        },
      },
      trip: {
        columns: {
          id: true,
          title: true,
        },
      },
    },
  });

  return posts.sort((a, b) => {
    const dateA = a.photo.takenAt ? new Date(a.photo.takenAt).getTime() : 0;
    const dateB = b.photo.takenAt ? new Date(b.photo.takenAt).getTime() : 0;
    return dateA - dateB;
  });
}

export async function queryPostsForTripEdit(
  from: Date,
  to: Date,
  tripId: string,
) {
  const posts = await db
    .select({
      id: PostsTable.id,
      spot: {
        name: SpotsTable.name,
      },
      photo: {
        url: PhotosTable.url,
        takenAt: PhotosTable.takenAt,
      },
    })
    .from(PostsTable)
    .innerJoin(PhotosTable, eq(PostsTable.photoId, PhotosTable.id))
    .innerJoin(SpotsTable, eq(PostsTable.spotId, SpotsTable.id))
    .leftJoin(TripsTable, eq(PostsTable.tripId, TripsTable.id))
    .where(
      and(
        gte(PhotosTable.takenAt, from),
        lt(PhotosTable.takenAt, new Date(to.getTime() + 1000 * 60 * 60 * 24)),
        or(isNull(PostsTable.tripId), eq(PostsTable.tripId, tripId)),
      ),
    )
    .orderBy(asc(PhotosTable.takenAt));

  return posts;
}

export async function deletePost(id: string): Promise<void> {
  await db.delete(PostsTable).where(eq(PostsTable.id, id));
}

export async function updatePost(params: {
  id: string;
  userId: string;
  description: string;
  spotId?: string;
  spotName?: string;
  cityId?: number;
}): Promise<Post> {
  return await db.transaction(async (tx) => {
    const [post] = await tx
      .select()
      .from(PostsTable)
      .where(eq(PostsTable.id, params.id));

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.userId !== params.userId) {
      throw new Error("Unauthorized");
    }

    let spotId = post.spotId;

    if (params.spotId) {
      const [foundSpot] = await tx
        .select()
        .from(SpotsTable)
        .where(eq(SpotsTable.id, params.spotId));
      if (!foundSpot) {
        throw new Error("Selected spot not found.");
      }
      spotId = foundSpot.id;
    } else if (params.spotName && params.cityId) {
      const [existingSpot] = await tx
        .select()
        .from(SpotsTable)
        .where(
          and(
            eq(SpotsTable.name, params.spotName),
            eq(SpotsTable.cityId, params.cityId),
          ),
        );

      if (existingSpot) {
        spotId = existingSpot.id;
      } else {
        const [newSpot] = await tx
          .insert(SpotsTable)
          .values({
            name: params.spotName,
            cityId: params.cityId,
          })
          .returning();
        spotId = newSpot.id;
      }
    }

    const [updatedPost] = await tx
      .update(PostsTable)
      .set({
        description: params.description,
        spotId: spotId,
        updatedAt: new Date(),
      })
      .where(eq(PostsTable.id, params.id))
      .returning();

    return updatedPost;
  });
}

export async function setTravel(params: {
  id: string;
  tripId: string | null;
  userId: string;
}): Promise<Post> {
  const [post] = await db
    .select()
    .from(PostsTable)
    .where(eq(PostsTable.id, params.id));

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.userId !== params.userId) {
    throw new Error("Unauthorized");
  }

  const [updatedPost] = await db
    .update(PostsTable)
    .set({
      tripId: params.tripId,
      updatedAt: new Date(),
    })
    .where(eq(PostsTable.id, params.id))
    .returning();

  return updatedPost;
}

export async function updatePostsTrip(
  tripId: string,
  postIds: string[],
): Promise<void> {
  await db.transaction(async (tx) => {
    // 1. Unassign all posts currently assigned to this trip
    await tx
      .update(PostsTable)
      .set({ tripId: null })
      .where(eq(PostsTable.tripId, tripId));

    // 2. Assign selected posts to this trip
    if (postIds.length > 0) {
      await tx
        .update(PostsTable)
        .set({ tripId: tripId })
        .where(inArray(PostsTable.id, postIds));
    }
  });
}

export type PostDetail = NonNullable<Awaited<ReturnType<typeof getPostById>>>;
export type PostList = Awaited<ReturnType<typeof getPosts>>[number];
export type PhotoForPost = PostDetail["photo"];
