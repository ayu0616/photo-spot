import { inject, injectable } from "inversify";
import { TYPES } from "@/constants/types";
import { PhotoEntity } from "../domain/photo/photo.entity";
import { PhotoId } from "../domain/photo/value-object/photo-id";
import { PhotoUrl } from "../domain/photo/value-object/photo-url";
import { PostEntity } from "../domain/post/post.entity";
import { CreatedAt } from "../domain/post/value-object/created-at";
import { PostDescription } from "../domain/post/value-object/post-description";
import { PostId } from "../domain/post/value-object/post-id";
import { UpdatedAt } from "../domain/post/value-object/updated-at";
import { SpotEntity } from "../domain/spot/spot.entity";
import { CityId } from "../domain/spot/value-object/city-id";
import { SpotId } from "../domain/spot/value-object/spot-id";
import { SpotName } from "../domain/spot/value-object/spot-name";
import { UserId } from "../domain/user/value-object/user-id";
import type { PostWithRelationsDto } from "../dto/post-dto";
import type { PhotoRepository } from "../repositories/photoRepository";
import type { PostRepository } from "../repositories/postRepository";
import type { SpotRepository } from "../repositories/spotRepository";
import type { ImageStorageService } from "./imageStorageService";

interface CreatePostParams {
  userId: string;
  description: string;
  imageFile: File;
  spotId?: string;
  spotName?: string;
  cityId?: number;
}

@injectable()
export class PostService {
  private photoRepository: PhotoRepository;
  private spotRepository: SpotRepository;
  private postRepository: PostRepository;
  private imageStorageService: ImageStorageService;

  constructor(
    @inject(TYPES.PhotoRepository) photoRepository: PhotoRepository,
    @inject(TYPES.SpotRepository) spotRepository: SpotRepository,
    @inject(TYPES.PostRepository) postRepository: PostRepository,
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
    return this.postRepository.findByIdWithRelations(id);
  }
}
