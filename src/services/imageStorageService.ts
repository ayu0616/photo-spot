import type { Readable } from "node:stream";
import { v4 as uuidv4 } from "uuid";
import type { StorageRepository } from "../repositories/storageRepository";

export class ImageStorageService {
  private storageRepository: StorageRepository;
  private bucketName: string;

  constructor(storageRepository: StorageRepository) {
    this.storageRepository = storageRepository;
    this.bucketName = process.env.GCS_BUCKET_NAME || "";
  }

  /**
   * 画像をアップロードし、公開URLを返す
   * @param imageFile - アップロードされた画像ファイル
   * @returns アップロード結果（ファイル名と公開URL）
   */
  async uploadImage(
    imageFile: File,
  ): Promise<{ fileName: string; url: string }> {
    // 1. ユニークなファイル名を生成
    const uniqueFileName = `${uuidv4()}-${imageFile.name}`;

    // 2. ファイルをバッファに変換
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    // 3. Repository を使ってファイルを保存
    await this.storageRepository.save(
      uniqueFileName,
      imageBuffer,
      imageFile.type,
    );

    // 4. ファイルを公開状態にする
    await this.storageRepository.makePublic(uniqueFileName);

    // 5. 環境に応じた公開URLを生成
    const publicUrl = this.buildPublicUrl(uniqueFileName);

    console.log(`ファイルがアップロードされました: ${publicUrl}`);
    return {
      fileName: uniqueFileName,
      url: publicUrl,
    };
  }

  /**
   * 指定されたファイル名の画像の読み取りストリームを取得する
   * @param fileName - GCS上のファイル名
   * @returns 読み取りストリーム、またはファイルが存在しない場合は null
   */
  async getImageStream(fileName: string): Promise<Readable | null> {
    const fileExists = await this.storageRepository.exists(fileName);
    if (!fileExists) {
      return null;
    }
    return this.storageRepository.createReadStream(fileName);
  }

  /**
   * 環境に応じて公開URLを組み立てる
   * @param fileName - GCS上のファイル名
   */
  private buildPublicUrl(fileName: string): string {
    if (process.env.NODE_ENV === "development") {
      return `${process.env.GCS_EMULATOR_HOST}/${this.bucketName}/${fileName}`;
    } else {
      return `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
    }
  }
}
