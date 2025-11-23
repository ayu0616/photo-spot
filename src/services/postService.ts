import { inject, injectable } from "inversify";
import { TYPES } from "@/constants/types";
import { PhotoEntity } from "../domain/photo/photo.entity";
import type { IPhotoRepository } from "../domain/photo/photo-repository.interface";
import { PhotoId } from "../domain/photo/value-object/photo-id";
import { PhotoUrl } from "../domain/photo/value-object/photo-url";
import { PostEntity } from "../domain/post/post.entity";
import type { IPostRepository } from "../domain/post/post-repository.interface";
import { CreatedAt } from "../domain/post/value-object/created-at";
import { PostDescription } from "../domain/post/value-object/post-description";
import { PostId } from "../domain/post/value-object/post-id";
import { UpdatedAt } from "../domain/post/value-object/updated-at";
import { SpotEntity } from "../domain/spot/spot.entity";
import type { ISpotRepository } from "../domain/spot/spot-repository.interface";
import { CityId } from "../domain/spot/value-object/city-id";
import { SpotId } from "../domain/spot/value-object/spot-id";
import { SpotName } from "../domain/spot/value-object/spot-name";
import { UserId } from "../domain/user/value-object/user-id";
import type { PostWithRelationsDto } from "../dto/post-dto";
import type { ImageStorageService } from "./imageStorageService";

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
        const spotId = new SpotId(crypto.randomUUID());
        const spotName = new SpotName(params.spotName);
        const cityId = new CityId(params.cityId);
        foundSpot = new SpotEntity(spotId, spotName, cityId);
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

    const postId = new PostId(crypto.randomUUID());
    const userId = new UserId(params.userId);
    const description = new PostDescription(params.description);
    const createdAt = new CreatedAt(new Date());
    const updatedAt = new UpdatedAt(new Date());

    const post = new PostEntity(
      postId,
      userId,
      description,
      spot.id,
      photo.id,
      null, // tripId
      createdAt,
      updatedAt,
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
        const spotId = new SpotId(crypto.randomUUID());
        const spotName = new SpotName(params.spotName);
        const cityId = new CityId(params.cityId);
        foundSpot = new SpotEntity(spotId, spotName, cityId);
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

    const description = new PostDescription(params.description);
    const updatedAt = new UpdatedAt(new Date());

    const updatedPost = new PostEntity(
      post.id,
      post.userId,
      description,
      spot.id,
      post.photoId,
      post.tripId,
      post.createdAt,
      updatedAt,
    );

    await this.postRepository.save(updatedPost);
    return updatedPost;
  }
}
