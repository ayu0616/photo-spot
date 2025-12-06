import { and, asc, eq, gte, lte } from "drizzle-orm";
import { injectable } from "inversify";
import { db } from "../../db";
import {
  CityMasterTable,
  PhotosTable,
  PostsTable,
  PrefectureMasterTable,
  SpotsTable,
  TripsTable,
  usersTable,
} from "../../db/schema";
import type { PostEntity } from "./domain/post.entity";
import type { IPostRepository } from "./domain/post-repository.interface";
import { PostDtoMapper, type PostWithRelationsDto } from "./PostDto";

@injectable()
export class PostRepository implements IPostRepository {
  async save(post: PostEntity): Promise<void> {
    const postDto = PostDtoMapper.fromEntity(post);
    await db
      .insert(PostsTable)
      .values({
        id: postDto.id,
        userId: postDto.userId,
        description: postDto.description,
        spotId: postDto.spotId,
        photoId: postDto.photoId,
        tripId: postDto.tripId,
        createdAt: postDto.createdAt,
        updatedAt: postDto.updatedAt,
      })
      .onConflictDoUpdate({
        target: PostsTable.id,
        set: {
          description: postDto.description,
          spotId: postDto.spotId,
          tripId: postDto.tripId,
          updatedAt: postDto.updatedAt,
        },
      });
  }

  async findById(id: string): Promise<PostEntity | null> {
    const postDto = await db.query.PostsTable.findFirst({
      where: eq(PostsTable.id, id),
    });
    if (!postDto) {
      return null;
    }
    return PostDtoMapper.toEntity(postDto);
  }

  async findAllWithRelations(
    limit: number,
    offset: number,
  ): Promise<PostWithRelationsDto[]> {
    const postsWithRelations = await db.query.PostsTable.findMany({
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

    return postsWithRelations as PostWithRelationsDto[];
  }

  async findByIdWithRelations(
    id: string,
  ): Promise<PostWithRelationsDto | null> {
    const postWithRelations = await db.query.PostsTable.findFirst({
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
            exif: true,
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

    if (!postWithRelations) {
      return null;
    }

    return postWithRelations as unknown as PostWithRelationsDto;
  }

  async findByTripId(tripId: string): Promise<PostWithRelationsDto[]> {
    const postsWithRelations = await db.query.PostsTable.findMany({
      where: eq(PostsTable.tripId, tripId),
      orderBy: (posts, { asc }) => [asc(posts.createdAt)], // Sort by createdAt for now, requirement says "photo date"
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
            takenAt: true, // Needed for sorting
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

    // Sort by photo.takenAt in memory if needed, or use DB sort if possible.
    // PhotosTable is joined. Drizzle sort on joined table?
    // For simplicity, sort in memory.
    const sortedPosts = postsWithRelations.sort((a, b) => {
      const dateA = a.photo.takenAt ? new Date(a.photo.takenAt).getTime() : 0;
      const dateB = b.photo.takenAt ? new Date(b.photo.takenAt).getTime() : 0;
      return dateA - dateB;
    });

    return sortedPosts as PostWithRelationsDto[];
  }

  async findByDateRange(from: Date, to: Date): Promise<PostWithRelationsDto[]> {
    const posts = await db
      .select()
      .from(PostsTable)
      .innerJoin(PhotosTable, eq(PostsTable.photoId, PhotosTable.id))
      .innerJoin(usersTable, eq(PostsTable.userId, usersTable.id))
      .innerJoin(SpotsTable, eq(PostsTable.spotId, SpotsTable.id))
      .innerJoin(CityMasterTable, eq(SpotsTable.cityId, CityMasterTable.id))
      .innerJoin(
        PrefectureMasterTable,
        eq(CityMasterTable.prefectureId, PrefectureMasterTable.id),
      )
      .innerJoin(TripsTable, eq(PostsTable.tripId, TripsTable.id))
      .where(and(gte(PhotosTable.takenAt, from), lte(PhotosTable.takenAt, to)))
      .orderBy(asc(PhotosTable.takenAt));

    const postsWithRelations: PostWithRelationsDto[] = posts.map((record) => {
      return {
        id: record.post.id,
        userId: record.post.userId,
        description: record.post.description,
        spotId: record.post.spotId,
        photoId: record.post.photoId,
        tripId: record.post.tripId,
        createdAt: record.post.createdAt,
        updatedAt: record.post.updatedAt,
        photo: record.photo,
        user: record.user,
        spot: {
          ...record.spot,
          city: {
            ...record.city_master,
            prefecture: record.prefecture_master,
          },
        },
        trip: record.trip,
      } satisfies PostWithRelationsDto;
    });

    return postsWithRelations;
  }

  async updateTripId(postId: string, tripId: string | null): Promise<void> {
    await db
      .update(PostsTable)
      .set({ tripId: tripId })
      .where(eq(PostsTable.id, postId));
  }

  async delete(id: string): Promise<void> {
    await db.delete(PostsTable).where(eq(PostsTable.id, id));
  }
}
