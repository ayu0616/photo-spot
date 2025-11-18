// src/repositories/postRepository.ts

import { eq } from "drizzle-orm";
import { injectable } from "inversify";
import { db } from "../db";
import { PostsTable } from "../db/schema";
import type { PostEntity } from "../domain/post/post.entity";
import { PostDtoMapper } from "../dto/post-dto";

@injectable()
export class PostRepository {
  async save(post: PostEntity): Promise<void> {
    const postDto = PostDtoMapper.fromEntity(post);
    await db.insert(PostsTable).values({
      id: postDto.id,
      userId: postDto.userId,
      description: postDto.description,
      spotId: postDto.spotId,
      photoId: postDto.photoId,
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
}
