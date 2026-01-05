import type { Readable } from "node:stream";
import { bucket } from "@/lib/gcsClient";

/**
 * ファイルをGCSに保存する
 * @param fileName - GCS上のファイル名
 * @param fileBuffer - 保存するファイルのバッファ
 * @param contentType - ファイルのMIMEタイプ
 */
export async function save(
  fileName: string,
  fileBuffer: Buffer,
  contentType: string,
): Promise<void> {
  const file = bucket.file(fileName);
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
export async function makePublic(fileName: string): Promise<void> {
  const file = bucket.file(fileName);
  await file.makePublic();
}

/**
 * ファイルの存在を確認する
 * @param fileName - GCS上のファイル名
 * @returns 存在すれば true
 */
export async function exists(fileName: string): Promise<boolean> {
  const [exists] = await bucket.file(fileName).exists();
  return exists;
}

/**
 * ファイルの読み取りストリームを取得する
 * @param fileName - GCS上のファイル名
 * @returns 読み取りストリーム
 */
export function createReadStream(fileName: string): Readable {
  return bucket.file(fileName).createReadStream();
}

/**
 * ファイルをGCSから削除する
 * @param fileName - GCS上のファイル名
 */
export async function deleteFile(fileName: string): Promise<void> {
  const file = bucket.file(fileName);
  await file.delete();
}
