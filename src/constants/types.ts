const TYPES = {
  // Repositories
  MasterRepository: Symbol.for("MasterRepository"),
  PhotoRepository: Symbol.for("PhotoRepository"),
  PostRepository: Symbol.for("PostRepository"),
  SpotRepository: Symbol.for("SpotRepository"),
  StorageRepository: Symbol.for("StorageRepository"),
  Bucket: Symbol.for("Bucket"),

  // Services
  ImageStorageService: Symbol.for("ImageStorageService"),
  PostService: Symbol.for("PostService"),

  // Controllers
  ImageController: Symbol.for("ImageController"),
  MasterController: Symbol.for("MasterController"),
  PostController: Symbol.for("PostController"),
  SpotController: Symbol.for("SpotController"),
};

export { TYPES };
