import type { PostWithRelationsDto } from "../../dto/post-dto";
import type { PostEntity } from "./post.entity";

export interface IPostRepository {
  save(post: PostEntity): Promise<void>;
  findById(id: string): Promise<PostEntity | null>;
  findAllWithRelations(
    limit: number,
    offset: number,
  ): Promise<PostWithRelationsDto[]>;
  findByIdWithRelations(id: string): Promise<PostWithRelationsDto | null>;
  findByTripId(tripId: string): Promise<PostWithRelationsDto[]>;
  updateTripId(postId: string, tripId: string | null): Promise<void>;
}
