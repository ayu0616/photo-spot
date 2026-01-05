import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { stream } from "hono/streaming";
import { z } from "zod";
import * as imageService from "./image.service";

const uploadImageSchema = z.object({
  image: z.instanceof(File, { message: "画像ファイルが必要です。" }),
});

export const app = new Hono()
  .post(
    "/upload",
    zValidator("form", uploadImageSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: (result.error as z.ZodError).flatten() }, 400);
      }
    }),
    async (c) => {
      try {
        const { image } = c.req.valid("form");

        const result = await imageService.uploadImage(image);

        return c.json({
          message: "アップロードが成功しました！",
          fileName: result.fileName,
          url: result.url,
          exifData: result.exifData,
        });
      } catch (error) {
        console.error("アップロードエラー:", error);
        return c.json({ error: "アップロード中にエラーが発生しました。" }, 500);
      }
    },
  )
  .get("/images/:filename", async (c) => {
    const { filename } = c.req.param();

    const readStream = await imageService.getImageStream(filename);

    if (!readStream) {
      return c.notFound();
    }

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
