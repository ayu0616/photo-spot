import { Container } from "inversify";
import { TYPES } from "@/constants/types";
import "reflect-metadata";
import type { Bucket } from "@google-cloud/storage"; // Import Bucket type
// Controllers
import { ImageController } from "@/controller/imageController";
import { MasterController } from "@/controller/masterController";
import { PostController } from "@/controller/postController";
import { SpotController } from "@/controller/spotController";
import { UserController } from "@/controller/userController"; // New
import { bucket } from "@/lib/gcsClient"; // Import the bucket instance
// Repositories
import { MasterRepository } from "@/repositories/masterRepository";
import { PhotoRepository } from "@/repositories/photoRepository";
import { PostRepository } from "@/repositories/postRepository";
import { SpotRepository } from "@/repositories/spotRepository";
import { StorageRepository } from "@/repositories/storageRepository";
import {
  type IUserRepository,
  UserRepository,
} from "@/repositories/userRepository"; // New
// Services
import { ImageStorageService } from "@/services/imageStorageService";
import { PostService } from "@/services/postService";
import { type IUserService, UserService } from "@/services/userService"; // New

const container = new Container();

// Bind Repositories
container.bind<MasterRepository>(TYPES.MasterRepository).to(MasterRepository);
container.bind<PhotoRepository>(TYPES.PhotoRepository).to(PhotoRepository);
container.bind<PostRepository>(TYPES.PostRepository).to(PostRepository);
container.bind<SpotRepository>(TYPES.SpotRepository).to(SpotRepository);
container
  .bind<StorageRepository>(TYPES.StorageRepository)
  .to(StorageRepository);
container.bind<Bucket>(TYPES.Bucket).toConstantValue(bucket); // Bind the GCS bucket instance
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository); // New

// Bind Services
container
  .bind<ImageStorageService>(TYPES.ImageStorageService)
  .to(ImageStorageService);
container.bind<PostService>(TYPES.PostService).to(PostService);
container.bind<IUserService>(TYPES.UserService).to(UserService); // New

// Bind Controllers
container.bind<ImageController>(TYPES.ImageController).to(ImageController);
container.bind<MasterController>(TYPES.MasterController).to(MasterController);
container.bind<PostController>(TYPES.PostController).to(PostController);
container.bind<SpotController>(TYPES.SpotController).to(SpotController);
container.bind<UserController>(TYPES.UserController).to(UserController); // New

export { container };
