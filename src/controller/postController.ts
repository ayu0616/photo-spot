// src/controller/postController.ts

import { Hono } from "hono";
import { PostDtoMapper } from "../dto/post-dto";
import { bucket } from "../lib/gcsClient";
import { PhotoRepository } from "../repositories/photoRepository";
import { PostRepository } from "../repositories/postRepository";
import { SpotRepository } from "../repositories/spotRepository";
import { StorageRepository } from "../repositories/storageRepository";
import { ImageStorageService } from "../services/imageStorageService";
import { PostService } from "../services/postService";

const postController = new Hono();

const storageRepository = new StorageRepository(bucket);
const imageStorageService = new ImageStorageService(storageRepository);

// Initialize repositories
const photoRepository = new PhotoRepository();
const spotRepository = new SpotRepository();
const postRepository = new PostRepository();

// Inject repositories into PostService
const postService = new PostService(
  photoRepository,
  spotRepository,
  postRepository,
);

postController.post("/posts", async (c) => {
  try {
    const formData = await c.req.formData();
    const imageFile = formData.get("image") as File;
    const description = formData.get("description") as string;
    const userId = formData.get("userId") as string; // Assuming userId is passed

    // Spot information can be either spotId or spotName + cityId
    const spotId = formData.get("spotId") as string | null;
    const spotName = formData.get("spotName") as string | null;
    const cityId = formData.get("cityId")
      ? Number(formData.get("cityId"))
      : null;

    if (!imageFile || !description || !userId) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    if (!spotId && (!spotName || !cityId)) {
      return c.json({ error: "Spot information is missing." }, 400);
    }

    // 1. 画像をGCSにアップロードし、EXIFデータを抽出
    const { url: photoUrl, exifData } =
      await imageStorageService.uploadImage(imageFile);

    // 2. PostServiceを使って投稿を作成
    const postEntity = await postService.createPost({
      userId,
      description,
      photoUrl,
      exifData: {
        raw: exifData.raw?.value || null,
        takenAt: exifData.takenAt?.value || null,
        cameraMake: exifData.cameraMake?.value || null,
        cameraModel: exifData.cameraModel?.value || null,
        latitude: exifData.latitude?.value || null,
        longitude: exifData.longitude?.value || null,
        orientation: exifData.orientation?.value || null,
        iso: exifData.iso?.value || null,
        lensMake: exifData.lensMake?.value || null,
        lensModel: exifData.lensModel?.value || null,
        lensSerial: exifData.lensSerial?.value || null,
        focalLength: exifData.focalLength?.value || null,
        focalLength35mm: exifData.focalLength35mm?.value || null,
        aperture: exifData.aperture?.value || null,
      },
      ...(spotId && { spotId }),
      ...(spotName && cityId && { spotName, cityId }),
    });

    // 3. DTOに変換して返す
    const postDto = PostDtoMapper.fromEntity(postEntity);

    return c.json(postDto, 201);
  } catch (error) {
    console.error("投稿作成中にエラーが発生しました:", error);
    return c.json({ error: "Failed to create post" }, 500);
  }
});

export default postController;
