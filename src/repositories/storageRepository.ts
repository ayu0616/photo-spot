import type { Readable } from "node:stream";
import type { Bucket } from "@google-cloud/storage";

export class StorageRepository {
  private bucket: Bucket;

  constructor(bucket: Bucket) {
    this.bucket = bucket;
  }

  /**
   * ファイルをGCSに保存する
   * @param fileName - GCS上のファイル名
   * @param fileBuffer - 保存するファイルのバッファ
   * @param contentType - ファイルのMIMEタイプ
   */
  async save(
    fileName: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<void> {
    const file = this.bucket.file(fileName);
    await file.save(fileBuffer, {
      metadata: {
        contentType: contentType,
      },
    });
  }

  /**
   * ファイルを一般公開に設定する
   * @param fileName - GCS上のファイル名
   */
  async makePublic(fileName: string): Promise<void> {
    const file = this.bucket.file(fileName);
    await file.makePublic();
  }

  /**
   * ファイルの存在を確認する
   * @param fileName - GCS上のファイル名
   * @returns 存在すれば true
   */
  async exists(fileName: string): Promise<boolean> {
    const [exists] = await this.bucket.file(fileName).exists();
    return exists;
  }

  /**
   * ファイルの読み取りストリームを取得する
   * @param fileName - GCS上のファイル名
   * @returns 読み取りストリーム
   */
  createReadStream(fileName: string): Readable {
    return this.bucket.file(fileName).createReadStream();
  }

  /**
   * ファイルをGCSから削除する
   * @param fileName - GCS上のファイル名
   */
  async delete(fileName: string): Promise<void> {
    const file = this.bucket.file(fileName);
    await file.delete();
  }
}
