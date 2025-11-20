const TYPES = {
  // Repositories
  MasterRepository: Symbol.for("MasterRepository"),
  PhotoRepository: Symbol.for("PhotoRepository"),
  PostRepository: Symbol.for("PostRepository"),
  SpotRepository: Symbol.for("SpotRepository"),
  StorageRepository: Symbol.for("StorageRepository"),
  UserRepository: Symbol.for("UserRepository"), // New
  Bucket: Symbol.for("Bucket"),

  // Services
  ImageStorageService: Symbol.for("ImageStorageService"),
  PostService: Symbol.for("PostService"),
  UserService: Symbol.for("UserService"), // New

  // Controllers
  ImageController: Symbol.for("ImageController"),
  MasterController: Symbol.for("MasterController"),
  PostController: Symbol.for("PostController"),
  SpotController: Symbol.for("SpotController"),
  UserController: Symbol.for("UserController"), // New
};

export { TYPES };
