// src/services/postService.ts

import { inject, injectable } from "inversify";
import { TYPES } from "@/constants/types";
import { PhotoEntity } from "../domain/photo/photo.entity";
import { Aperture } from "../domain/photo/value-object/aperture";
import { CameraMake } from "../domain/photo/value-object/camera-make";
import { CameraModel } from "../domain/photo/value-object/camera-model";
import { FocalLength } from "../domain/photo/value-object/focal-length";
import { FocalLength35mm } from "../domain/photo/value-object/focal-length-35mm";
import { Iso } from "../domain/photo/value-object/iso";
import { Latitude } from "../domain/photo/value-object/latitude";
import { LensMake } from "../domain/photo/value-object/lens-make";
import { LensModel } from "../domain/photo/value-object/lens-model";
import { LensSerial } from "../domain/photo/value-object/lens-serial";
import { Longitude } from "../domain/photo/value-object/longitude";
import { Orientation } from "../domain/photo/value-object/orientation";
import { PhotoExif } from "../domain/photo/value-object/photo-exif";
import { PhotoId } from "../domain/photo/value-object/photo-id";
import { PhotoUrl } from "../domain/photo/value-object/photo-url";
import { TakenAt } from "../domain/photo/value-object/taken-at";
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
import type { PostWithRelationsDto } from "../dto/post-dto"; // 追加
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
    const photoExif = exifData.raw ? new PhotoExif(exifData.raw.value) : null;
    const takenAt = exifData.takenAt
      ? new TakenAt(exifData.takenAt.value)
      : null;
    const cameraMake = exifData.cameraMake
      ? new CameraMake(exifData.cameraMake.value)
      : null;
    const cameraModel = exifData.cameraModel
      ? new CameraModel(exifData.cameraModel.value)
      : null;
    const latitude = exifData.latitude
      ? new Latitude(exifData.latitude.value)
      : null;
    const longitude = exifData.longitude
      ? new Longitude(exifData.longitude.value)
      : null;
    const orientation = exifData.orientation
      ? new Orientation(exifData.orientation.value)
      : null;
    const iso = exifData.iso ? new Iso(exifData.iso.value) : null;
    const lensMake = exifData.lensMake
      ? new LensMake(exifData.lensMake.value)
      : null;
    const lensModel = exifData.lensModel
      ? new LensModel(exifData.lensModel.value)
      : null;
    const lensSerial = exifData.lensSerial
      ? new LensSerial(exifData.lensSerial.value)
      : null;
    const focalLength = exifData.focalLength
      ? new FocalLength(exifData.focalLength.value)
      : null;
    const focalLength35mm = exifData.focalLength35mm
      ? new FocalLength35mm(exifData.focalLength35mm.value)
      : null;
    const aperture = exifData.aperture
      ? new Aperture(exifData.aperture.value)
      : null;
    const shutterSpeed = exifData.shutterSpeed ? exifData.shutterSpeed : null;

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
