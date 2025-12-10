import { inject, injectable } from "inversify";
import { TYPES } from "@/constants/types";
import type { IPhotoRepository } from "@/features/photo/domain/photo-repository.interface";
import { PhotoId } from "@/features/photo/domain/value-object/photo-id";
import { PhotoUrl } from "@/features/photo/domain/value-object/photo-url";
import type { ImageStorageService } from "@/features/photo/ImageStorageService";
import { SpotEntity } from "@/features/spot/domain/spot.entity";
import type { ISpotRepository } from "@/features/spot/domain/spot-repository.interface";
import { CityId } from "@/features/spot/domain/value-object/city-id";
import { SpotName } from "@/features/spot/domain/value-object/spot-name";
import { UserId } from "@/features/user/domain/value-object/user-id";
import { PhotoEntity } from "../photo/domain/photo.entity";
import { TripId } from "../trip/domain/value-object/trip-id";
import { PostEntity } from "./domain/post.entity";
import type { IPostRepository } from "./domain/post-repository.interface";
import { PostDescription } from "./domain/value-object/post-description";
import type { PostWithRelationsDto } from "./PostDto";

interface CreatePostParams {
  userId: string;
  description: string;
  imageFile: File;
  spotId?: string;
  spotName?: string;
  cityId?: number;
}

interface UpdatePostParams {
  id: string;
  userId: string;
  description: string;
  spotId?: string;
  spotName?: string;
  cityId?: number;
}

@injectable()
export class PostService {
  private photoRepository: IPhotoRepository;
  private spotRepository: ISpotRepository;
  private postRepository: IPostRepository;
  private imageStorageService: ImageStorageService;

  constructor(
    @inject(TYPES.PhotoRepository) photoRepository: IPhotoRepository,
    @inject(TYPES.SpotRepository) spotRepository: ISpotRepository,
    @inject(TYPES.PostRepository) postRepository: IPostRepository,
    @inject(TYPES.ImageStorageService) imageStorageService: ImageStorageService,
  ) {
    this.photoRepository = photoRepository;
    this.spotRepository = spotRepository;
    this.postRepository = postRepository;
    this.imageStorageService = imageStorageService;
  }

  async createPost(params: CreatePostParams): Promise<PostEntity> {
    let spot: SpotEntity;

    if (params.spotId) {
      const foundSpot = await this.spotRepository.findById(params.spotId);
      if (!foundSpot) {
        throw new Error("Selected spot not found.");
      }
      spot = foundSpot;
    } else if (params.spotName && params.cityId) {
      let foundSpot = await this.spotRepository.findByNameAndCityId(
        params.spotName,
        params.cityId,
      );

      if (!foundSpot) {
        const spotName = new SpotName(params.spotName);
        const cityId = new CityId(params.cityId);
        foundSpot = SpotEntity.create(spotName, cityId);
        await this.spotRepository.save(foundSpot);
      }
      spot = foundSpot;
    } else {
      throw new Error("Spot information is missing.");
    }

    const { url: photoUrl, exifData } =
      await this.imageStorageService.uploadImage(params.imageFile);

    const photoId = new PhotoId(crypto.randomUUID());
    const photoUrlVo = new PhotoUrl(photoUrl);
    const photoExif = exifData.raw;
    const takenAt = exifData.takenAt;
    const cameraMake = exifData.cameraMake;
    const cameraModel = exifData.cameraModel;
    const latitude = exifData.latitude;
    const longitude = exifData.longitude;
    const orientation = exifData.orientation;
    const iso = exifData.iso;
    const lensMake = exifData.lensMake;
    const lensModel = exifData.lensModel;
    const lensSerial = exifData.lensSerial;
    const focalLength = exifData.focalLength;
    const focalLength35mm = exifData.focalLength35mm;
    const aperture = exifData.aperture;
    const shutterSpeed = exifData.shutterSpeed;

    const photo = new PhotoEntity(
      photoId,
      photoUrlVo,
      photoExif,
      takenAt,
      cameraMake,
      cameraModel,
      latitude,
      longitude,
      orientation,
      iso,
      lensMake,
      lensModel,
      lensSerial,
      focalLength,
      focalLength35mm,
      aperture,
      shutterSpeed,
    );
    await this.photoRepository.save(photo);

    const userId = new UserId(params.userId);
    const description = new PostDescription(params.description);

    const post = PostEntity.create(
      userId,
      description,
      spot.id,
      photo.id,
      null, // tripId
    );
    await this.postRepository.save(post);

    return post;
  }

  async getPosts(
    limit: number,
    offset: number,
  ): Promise<PostWithRelationsDto[]> {
    return this.postRepository.findAllWithRelations(limit, offset);
  }

  async getPostById(id: string): Promise<PostWithRelationsDto | null> {
    return await this.postRepository.findByIdWithRelations(id);
  }

  async getPostsByTripId(tripId: string): Promise<PostWithRelationsDto[]> {
    return await this.postRepository.findByTripId(tripId);
  }

  async queryPosts({
    from,
    to,
  }: {
    from: Date;
    to: Date;
  }): Promise<PostWithRelationsDto[]> {
    return this.postRepository.findByDateRange(from, to);
  }

  async updatePostsTrip(tripId: string, postIds: string[]): Promise<void> {
    // 1. Unassign all posts currently assigned to this trip
    const currentPosts = await this.postRepository.findByTripId(tripId);
    for (const post of currentPosts) {
      await this.postRepository.updateTripId(post.id, null);
    }

    // 2. Assign selected posts to this trip
    for (const postId of postIds) {
      await this.postRepository.updateTripId(postId, tripId);
    }
  }

  async deletePost(id: string): Promise<void> {
    await this.postRepository.delete(id);
  }

  async updatePost(params: UpdatePostParams): Promise<PostEntity> {
    const post = await this.postRepository.findById(params.id);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.userId.value !== params.userId) {
      throw new Error("Unauthorized");
    }

    let spot: SpotEntity;

    if (params.spotId) {
      const foundSpot = await this.spotRepository.findById(params.spotId);
      if (!foundSpot) {
        throw new Error("Selected spot not found.");
      }
      spot = foundSpot;
    } else if (params.spotName && params.cityId) {
      let foundSpot = await this.spotRepository.findByNameAndCityId(
        params.spotName,
        params.cityId,
      );

      if (!foundSpot) {
        const spotName = new SpotName(params.spotName);
        const cityId = new CityId(params.cityId);
        foundSpot = SpotEntity.create(spotName, cityId);
        await this.spotRepository.save(foundSpot);
      }
      spot = foundSpot;
    } else {
      // Keep existing spot if no new spot info provided?
      // Or throw error if spot info is mandatory for update?
      // Assuming spot info is mandatory for update as per create logic
      // But if user doesn't want to change spot, they might send existing spotId.
      // Let's assume if neither is provided, we keep the old spot.
      // However, the UI form will likely send the current values.
      // Let's stick to the logic: if provided, update.
      // But wait, post entity is immutable-ish.
      // We need to create a new PostEntity or update the existing one.
      // Since we are using DDD, we should probably have a method on PostEntity to update details.
      // But for now, let's just reconstruct it or update fields.
      // Actually, I can just fetch the existing spot if no new info is provided.
      const existingSpot = await this.spotRepository.findById(
        post.spotId.value,
      );
      if (!existingSpot) {
        throw new Error("Existing spot not found"); // Should not happen
      }
      spot = existingSpot;
    }

    post.updateDescription(new PostDescription(params.description));
    post.updateSpotId(spot.id);

    await this.postRepository.save(post);
    return post;
  }

  async setTravel(params: {
    id: string;
    tripId: string | null;
    userId: string;
  }): Promise<PostEntity> {
    const { id, tripId, userId } = params;
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.userId.value !== userId) {
      throw new Error("Unauthorized");
    }

    post.updateTripId(tripId ? new TripId(tripId) : null);
    await this.postRepository.save(post);
    return post;
  }
}
