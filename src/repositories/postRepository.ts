import { eq } from "drizzle-orm";
import { injectable } from "inversify";
import { db } from "../db";
import { PostsTable } from "../db/schema";
import type { PostEntity } from "../domain/post/post.entity";
import type { IPostRepository } from "../domain/post/post-repository.interface";
import { PostDtoMapper, type PostWithRelationsDto } from "../dto/post-dto";

@injectable()
export class PostRepository implements IPostRepository {
  async save(post: PostEntity): Promise<void> {
    const postDto = PostDtoMapper.fromEntity(post);
    await db.insert(PostsTable).values({
      id: postDto.id,
      userId: postDto.userId,
      description: postDto.description,
      spotId: postDto.spotId,
      photoId: postDto.photoId,
      tripId: postDto.tripId,
      createdAt: postDto.createdAt,
      updatedAt: postDto.updatedAt,
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

    return sortedPosts as unknown as PostWithRelationsDto[];
  }
}
