import type { Readable } from "node:stream";
import type { ExifTags } from "exifreader";
import * as ExifReader from "exifreader";
import { v4 as uuidv4 } from "uuid";
import { Aperture } from "../domain/photo/value-object/aperture";
import { CameraMake } from "../domain/photo/value-object/camera-make";
import { CameraModel } from "../domain/photo/value-object/camera-model";
import { FocalLength } from "../domain/photo/value-object/focal-length";
import { FocalLength35mm } from "../domain/photo/value-object/focal-length-35mm";
import { Iso } from "../domain/photo/value-object/iso";
import { Latitude } from "../domain/photo/value-object/latitude";
import { LensMake } from "../domain/photo/value-object/lens-make";
import { LensModel } from "../domain/photo/value-object/lens-model";
import type { LensSerial } from "../domain/photo/value-object/lens-serial";
import { Longitude } from "../domain/photo/value-object/longitude";
import { Orientation } from "../domain/photo/value-object/orientation";
import { PhotoExif } from "../domain/photo/value-object/photo-exif";
import { TakenAt } from "../domain/photo/value-object/taken-at";
import type { StorageRepository } from "../repositories/storageRepository";

// Helper function to convert GPS coordinates from array of arrays to string
function convertGpsCoordinate(
  coordinate:
    | [[number, number], [number, number], [number, number]]
    | undefined,
  ref: string | undefined,
): string | null {
  if (!coordinate || coordinate.length < 3 || !ref) {
    return null;
  }
  const degrees = coordinate[0][0] / coordinate[0][1];
  const minutes = coordinate[1][0] / coordinate[1][1];
  const seconds = coordinate[2][0] / coordinate[2][1];
  return `${degrees}°${minutes}'${seconds}" ${ref}`;
}

// Helper function to convert RationalTag to string
function formatRational(rational: [number, number] | undefined): string | null {
  if (!rational) {
    return null;
  }
  return `${rational[0]}/${rational[1]}`;
}

export class ImageStorageService {
  private storageRepository: StorageRepository;
  private bucketName: string;

  constructor(storageRepository: StorageRepository) {
    this.storageRepository = storageRepository;
    this.bucketName = process.env.GCS_BUCKET_NAME || "";
  }

  /**
   * 画像をアップロードし、公開URLとEXIFデータを返す
   * @param imageFile - アップロードされた画像ファイル
   * @returns アップロード結果（ファイル名、公開URL、EXIFデータ）
   */
  async uploadImage(imageFile: File): Promise<{
    fileName: string;
    url: string;
    exifData: {
      raw: PhotoExif | null;
      takenAt: TakenAt | null;
      cameraMake: CameraMake | null;
      cameraModel: CameraModel | null;
      latitude: Latitude | null;
      longitude: Longitude | null;
      orientation: Orientation | null;
      iso: Iso | null;
      lensMake: LensMake | null;
      lensModel: LensModel | null;
      lensSerial: LensSerial | null;
      focalLength: FocalLength | null;
      focalLength35mm: FocalLength35mm | null;
      aperture: Aperture | null;
    };
  }> {
    // 1. ユニークなファイル名を生成
    const uniqueFileName = `${uuidv4()}-${imageFile.name}`;

    // 2. ファイルをバッファに変換
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    // 3. EXIFデータを抽出
    const exifData = this.extractExifData(imageBuffer);

    // 4. Repository を使ってファイルを保存
    await this.storageRepository.save(
      uniqueFileName,
      imageBuffer,
      imageFile.type,
    );

    // 5. ファイルを公開状態にする
    if (process.env.NODE_ENV !== "development") {
      await this.storageRepository.makePublic(uniqueFileName);
    }

    // 6. 環境に応じた公開URLを生成
    const publicUrl = this.buildPublicUrl(uniqueFileName);

    console.log(`ファイルがアップロードされました: ${publicUrl}`);
    return {
      fileName: uniqueFileName,
      url: publicUrl,
      exifData,
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
   * 画像バッファからEXIFデータを抽出する
   * @param imageBuffer - 画像ファイルのバッファ
   * @returns 抽出されたEXIFデータ
   */
  private extractExifData(imageBuffer: Buffer): {
    raw: PhotoExif | null;
    takenAt: TakenAt | null;
    cameraMake: CameraMake | null;
    cameraModel: CameraModel | null;
    latitude: Latitude | null;
    longitude: Longitude | null;
    orientation: Orientation | null;
    iso: Iso | null;
    lensMake: LensMake | null;
    lensModel: LensModel | null;
    lensSerial: LensSerial | null;
    focalLength: FocalLength | null;
    focalLength35mm: FocalLength35mm | null;
    aperture: Aperture | null;
  } {
    try {
      const tags = ExifReader.load(imageBuffer) as ExifTags;
      // console.log("EXIF Tags:", tags); // Removed console.log

      const rawExif = new PhotoExif(JSON.stringify(tags));

      // 共通のパース済み EXIF フィールド
      const takenAt = tags.DateTimeOriginal?.value?.[0]
        ? new TakenAt(
            new Date(
              tags.DateTimeOriginal.value[0].replace(
                /(\d{4}):(\d{2}):(\d{2})/,
                "$1-$2-$3",
              ),
            ),
          )
        : null;
      const cameraMake = tags.Make?.value?.[0]
        ? new CameraMake(tags.Make.value[0] as string)
        : null;
      const cameraModel = tags.Model?.value?.[0]
        ? new CameraModel(tags.Model.value[0] as string)
        : null;

      const gpsLatitude = convertGpsCoordinate(
        tags.GPSLatitude?.value,
        tags.GPSLatitudeRef?.value?.[0],
      );
      const latitude = gpsLatitude ? new Latitude(gpsLatitude) : null;

      const gpsLongitude = convertGpsCoordinate(
        tags.GPSLongitude?.value,
        tags.GPSLongitudeRef?.value?.[0],
      );
      const longitude = gpsLongitude ? new Longitude(gpsLongitude) : null;

      const orientation = tags.Orientation?.value
        ? new Orientation(tags.Orientation.value as number)
        : null;
      const iso = tags.ISOSpeedRatings?.value
        ? new Iso(tags.ISOSpeedRatings.value as number)
        : null;

      // レンズ関連フィールド
      const lensMake = tags.LensMake?.value?.[0]
        ? new LensMake(tags.LensMake.value[0] as string)
        : null;
      const lensModel = tags.LensModel?.value?.[0]
        ? new LensModel(tags.LensModel.value[0] as string)
        : null;

      const focalLength = formatRational(tags.FocalLength?.value)
        ? new FocalLength(formatRational(tags.FocalLength?.value) as string)
        : null;
      const focalLength35mm = tags.FocalLengthIn35mmFilm?.value
        ? new FocalLength35mm(String(tags.FocalLengthIn35mmFilm.value))
        : null;
      const aperture = formatRational(tags.FNumber?.value)
        ? new Aperture(formatRational(tags.FNumber?.value) as string)
        : null;

      return {
        raw: rawExif,
        takenAt,
        cameraMake,
        cameraModel,
        latitude,
        longitude,
        orientation,
        iso,
        lensMake,
        lensModel,
        lensSerial: null,
        focalLength,
        focalLength35mm,
        aperture,
      };
    } catch (error) {
      console.error("EXIFデータの抽出中にエラーが発生しました:", error);
      return {
        raw: null,
        takenAt: null,
        cameraMake: null,
        cameraModel: null,
        latitude: null,
        longitude: null,
        orientation: null,
        iso: null,
        lensMake: null,
        lensModel: null,
        lensSerial: null,
        focalLength: null,
        focalLength35mm: null,
        aperture: null,
      };
    }
  }

  /**
   * 環境に応じて公開URLを組み立てる
   * @param fileName - GCS上のファイル名
   */
  private buildPublicUrl(fileName: string): string {
    if (process.env.NODE_ENV === "development") {
      return `${process.env.GCS_URL}/${this.bucketName}/${fileName}`;
    } else {
      return `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
    }
  }
}
