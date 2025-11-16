import { Hono } from "hono";
import { stream } from "hono/streaming";

import { bucket } from "../lib/gcsClient";
import { StorageRepository } from "../repositories/storageRepository";
import { ImageStorageService } from "../services/imageStorageService";

// 1. Repository と Service をインスタンス化
const storageRepository = new StorageRepository(bucket);
const imageStorageService = new ImageStorageService(storageRepository);

export const imageController = new Hono()
  /**
   * 画像アップロード処理
   */
  .post("/upload", async (c) => {
    try {
      const body = await c.req.parseBody();
      const imageFile = body.image as File;

      if (!(imageFile instanceof File) || imageFile.size === 0) {
        return c.json({ error: "画像ファイルが見つかりません。" }, 400);
      }

      // 2. Service のメソッドを呼び出す
      const result = await imageStorageService.uploadImage(imageFile);

      return c.json({
        message: "アップロードが成功しました！",
        fileName: result.fileName,
        url: result.url,
      });
    } catch (error) {
      console.error("アップロードエラー:", error);
      return c.json({ error: "アップロード中にエラーが発生しました。" }, 500);
    }
  })

  /**
   * 画像配信処理
   */
  .get("/images/:filename", async (c) => {
    const { filename } = c.req.param();

    // 3. Service のメソッドを呼び出す
    const readStream = await imageStorageService.getImageStream(filename);

    if (!readStream || !(readStream instanceof ReadableStream)) {
      return c.notFound();
    }

    return stream(c, async (stream) => {
      await stream.pipe(readStream);
    });
  });
