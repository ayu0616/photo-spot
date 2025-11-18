import { Hono } from "hono";
import { stream } from "hono/streaming";
import { inject, injectable } from "inversify";
import { TYPES } from "@/constants/types";
import type { ImageStorageService } from "../services/imageStorageService";

@injectable()
export class ImageController {
  private readonly imageStorageService: ImageStorageService;

  public constructor(
    @inject(TYPES.ImageStorageService) imageStorageService: ImageStorageService,
  ) {
    this.imageStorageService = imageStorageService;
  }

  public readonly app = new Hono()
    .post("/upload", async (c) => {
      try {
        const body = await c.req.parseBody();
        const imageFile = body.image as File;

        if (!(imageFile instanceof File) || imageFile.size === 0) {
          return c.json({ error: "画像ファイルが見つかりません。" }, 400);
        }

        const result = await this.imageStorageService.uploadImage(imageFile);

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
    .get("/images/:filename", async (c) => {
      const { filename } = c.req.param();

      const readStream =
        await this.imageStorageService.getImageStream(filename);

      if (!readStream) {
        return c.notFound();
      }

      // HonoのstreamヘルパーはReadableStreamを期待するため、Node.jsのReadableを変換
      // Node.jsのReadableをWeb Stream (ReadableStream) に変換する
      const webStream = new ReadableStream({
        start(controller) {
          readStream.on("data", (chunk) => {
            controller.enqueue(chunk);
          });
          readStream.on("end", () => {
            controller.close();
          });
          readStream.on("error", (err) => {
            controller.error(err);
          });
        },
      });

      return stream(c, async (stream) => {
        await stream.pipe(webStream);
      });
    });
}
