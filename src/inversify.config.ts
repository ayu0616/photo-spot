import { Container } from "inversify";
import { TYPES } from "@/constants/types";
import "reflect-metadata";
import type { Bucket } from "@google-cloud/storage"; // Import Bucket type
import { MasterController } from "@/features/master/MasterController";
// Repositories
import { MasterRepository } from "@/features/master/MasterRepository";
import type { IPhotoRepository } from "@/features/photo/domain/photo-repository.interface";
// Controllers
import { ImageController } from "@/features/photo/ImageController";
// Services
import { ImageStorageService } from "@/features/photo/ImageStorageService";
import { PhotoRepository } from "@/features/photo/PhotoRepository";
import { StorageRepository } from "@/features/photo/StorageRepository";
import type { IPostRepository } from "@/features/post/domain/post-repository.interface";
import { PostController } from "@/features/post/PostController";
import { PostRepository } from "@/features/post/PostRepository";
import { PostService } from "@/features/post/PostService";
import type { ISpotRepository } from "@/features/spot/domain/spot-repository.interface";
import { SpotController } from "@/features/spot/SpotController";
import { SpotRepository } from "@/features/spot/SpotRepository";
import type { IUserRepository } from "@/features/user/domain/user-repository.interface";
import { UserController } from "@/features/user/UserController";
import { UserRepository } from "@/features/user/UserRepository";
import { type IUserService, UserService } from "@/features/user/UserService";
import { bucket } from "@/lib/gcsClient"; // Import the bucket instance

const container = new Container();

// Bind Repositories
container.bind<MasterRepository>(TYPES.MasterRepository).to(MasterRepository);
container.bind<IPhotoRepository>(TYPES.PhotoRepository).to(PhotoRepository);
container.bind<IPostRepository>(TYPES.PostRepository).to(PostRepository);
container.bind<ISpotRepository>(TYPES.SpotRepository).to(SpotRepository);
container
  .bind<StorageRepository>(TYPES.StorageRepository)
  .to(StorageRepository);
container.bind<Bucket>(TYPES.Bucket).toConstantValue(bucket); // Bind the GCS bucket instance
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);

// Bind Services
container
  .bind<ImageStorageService>(TYPES.ImageStorageService)
  .to(ImageStorageService);
container.bind<PostService>(TYPES.PostService).to(PostService);
container.bind<IUserService>(TYPES.UserService).to(UserService);

// Bind Controllers
container.bind<ImageController>(TYPES.ImageController).to(ImageController);
container.bind<MasterController>(TYPES.MasterController).to(MasterController);
container.bind<PostController>(TYPES.PostController).to(PostController);
container.bind<SpotController>(TYPES.SpotController).to(SpotController);
container.bind<UserController>(TYPES.UserController).to(UserController);

// Bind Trip
import type { ITripRepository } from "@/features/trip/domain/trip-repository.interface";
import { TripRepository } from "@/features/trip/TripRepository";
import { TripService } from "@/features/trip/TripService";

container.bind<ITripRepository>(TYPES.TripRepository).to(TripRepository);
container.bind<TripService>(TYPES.TripService).to(TripService);

import { TripController } from "@/features/trip/trip.controller";

container.bind<TripController>(TYPES.TripController).to(TripController);

export { container };
