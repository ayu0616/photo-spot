// src/services/postService.ts

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
import type { PhotoRepository } from "../repositories/photoRepository";
import type { PostRepository } from "../repositories/postRepository";
import type { SpotRepository } from "../repositories/spotRepository";

interface CreatePostParams {
  userId: string;
  description: string;
  photoUrl: string;
  exifData: {
    raw: string | null;
    takenAt: Date | null;
    cameraMake: string | null;
    cameraModel: string | null;
    latitude: string | null;
    longitude: string | null;
    orientation: number | null;
    iso: number | null;
    lensMake: string | null;
    lensModel: string | null;
    lensSerial: string | null;
    focalLength: string | null;
    focalLength35mm: string | null;
    aperture: string | null;
  };
  // Optional parameters for spot
  spotId?: string;
  spotName?: string;
  cityId?: number;
}

export class PostService {
  private photoRepository: PhotoRepository;
  private spotRepository: SpotRepository;
  private postRepository: PostRepository;

  constructor(
    photoRepository: PhotoRepository,
    spotRepository: SpotRepository,
    postRepository: PostRepository,
  ) {
    this.photoRepository = photoRepository;
    this.spotRepository = spotRepository;
    this.postRepository = postRepository;
  }

  async createPost(params: CreatePostParams): Promise<PostEntity> {
    let spot: SpotEntity;

    if (params.spotId) {
      // 既存のスポットを選択した場合
      const foundSpot = await this.spotRepository.findById(params.spotId);
      if (!foundSpot) {
        throw new Error("Selected spot not found.");
      }
      spot = foundSpot;
    } else if (params.spotName && params.cityId) {
      // 新しいスポットを作成または既存のスポットを検索する場合
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

    // 2. PhotoEntityの作成
    const photoId = new PhotoId(crypto.randomUUID());
    const photoUrl = new PhotoUrl(params.photoUrl);
    const photoExif = params.exifData.raw
      ? new PhotoExif(params.exifData.raw)
      : null;
    const takenAt = params.exifData.takenAt
      ? new TakenAt(params.exifData.takenAt)
      : null;
    const cameraMake = params.exifData.cameraMake
      ? new CameraMake(params.exifData.cameraMake)
      : null;
    const cameraModel = params.exifData.cameraModel
      ? new CameraModel(params.exifData.cameraModel)
      : null;
    const latitude = params.exifData.latitude
      ? new Latitude(params.exifData.latitude)
      : null;
    const longitude = params.exifData.longitude
      ? new Longitude(params.exifData.longitude)
      : null;
    const orientation = params.exifData.orientation
      ? new Orientation(params.exifData.orientation)
      : null;
    const iso = params.exifData.iso ? new Iso(params.exifData.iso) : null;
    const lensMake = params.exifData.lensMake
      ? new LensMake(params.exifData.lensMake)
      : null;
    const lensModel = params.exifData.lensModel
      ? new LensModel(params.exifData.lensModel)
      : null;
    const lensSerial = params.exifData.lensSerial
      ? new LensSerial(params.exifData.lensSerial)
      : null;
    const focalLength = params.exifData.focalLength
      ? new FocalLength(params.exifData.focalLength)
      : null;
    const focalLength35mm = params.exifData.focalLength35mm
      ? new FocalLength35mm(params.exifData.focalLength35mm)
      : null;
    const aperture = params.exifData.aperture
      ? new Aperture(params.exifData.aperture)
      : null;

    const photo = new PhotoEntity(
      photoId,
      photoUrl,
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
    );
    await this.photoRepository.save(photo);

    // 3. PostEntityの作成
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
}
