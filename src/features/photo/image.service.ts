import type { Readable } from "node:stream";
import type { ExifTags } from "exifreader";
import * as ExifReader from "exifreader";
import { v4 as uuidv4 } from "uuid";
import * as storageService from "./storage.service";

// Helper function to convert GPS coordinates from array of arrays to string
function convertGpsCoordinateToNumber(
  coordinate:
    | [[number, number], [number, number], [number, number]]
    | undefined,
  ref: string | undefined,
): number | null {
  if (!coordinate || coordinate.length < 3 || !ref) {
    return null;
  }
  const degrees = coordinate[0][0] / coordinate[0][1];
  const minutes = coordinate[1][0] / coordinate[1][1];
  const seconds = coordinate[2][0] / coordinate[2][1];

  let decimal = degrees + minutes / 60 + seconds / 3600;

  if (ref === "S" || ref === "W") {
    decimal = decimal * -1;
  }

  return decimal;
}

// Helper function to convert RationalTag to string
function formatRational(rational: [number, number] | undefined): string | null {
  if (!rational) {
    return null;
  }
  return `${rational[0]}/${rational[1]}`;
}

export type ExifData = {
  takenAt: Date | null;
  cameraMake: string | null;
  cameraModel: string | null;
  latitude: number | null;
  longitude: number | null;
  orientation: number | null;
  iso: number | null;
  lensMake: string | null;
  lensModel: string | null;
  lensSerial: string | null;
  focalLength: string | null;
  focalLength35mm: string | null;
  aperture: string | null;
  shutterSpeed: string | null;
};

const bucketName = process.env.GCS_BUCKET_NAME || "";

/**
 * 画像をアップロードし、公開URLとEXIFデータを返す
 * @param imageFile - アップロードされた画像ファイル
 * @returns アップロード結果（ファイル名、公開URL、EXIFデータ）
 */
export async function uploadImage(imageFile: File): Promise<{
  fileName: string;
  url: string;
  exifData: ExifData;
}> {
  // 1. ユニークなファイル名を生成
  const uniqueFileName = `${uuidv4()}-${imageFile.name}`;

  // 2. ファイルをバッファに変換
  const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

  // 3. EXIFデータを抽出
  const exifData = extractExifData(imageBuffer);

  // 4. Repository を使ってファイルを保存
  await storageService.save(uniqueFileName, imageBuffer, imageFile.type);

  // 6. 環境に応じて公開URLを生成
  const publicUrl = buildPublicUrl(uniqueFileName);

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
export async function getImageStream(
  fileName: string,
): Promise<Readable | null> {
  const fileExists = await storageService.exists(fileName);
  if (!fileExists) {
    return null;
  }
  return storageService.createReadStream(fileName);
}

/**
 * 画像バッファからEXIFデータを抽出する
 * @param imageBuffer - 画像ファイルのバッファ
 * @returns 抽出されたEXIFデータ
 */
function extractExifData(imageBuffer: Buffer): ExifData {
  try {
    const tags = ExifReader.load(imageBuffer) as ExifTags;

    const takenAt = tags.DateTimeOriginal?.value?.[0]
      ? new Date(
          tags.DateTimeOriginal.value[0].replace(
            /(\d{4}):(\d{2}):(\d{2})/,
            "$1-$2-$3",
          ),
        )
      : null;
    const cameraMake = tags.Make?.value?.[0]
      ? (tags.Make.value[0] as string)
      : null;
    const cameraModel = tags.Model?.value?.[0]
      ? (tags.Model.value[0] as string)
      : null;

    const latitude = convertGpsCoordinateToNumber(
      tags.GPSLatitude?.value,
      tags.GPSLatitudeRef?.value?.[0],
    );

    const longitude = convertGpsCoordinateToNumber(
      tags.GPSLongitude?.value,
      tags.GPSLongitudeRef?.value?.[0],
    );

    const orientation = tags.Orientation?.value
      ? (tags.Orientation.value as number)
      : null;
    const iso = tags.ISOSpeedRatings?.value
      ? (tags.ISOSpeedRatings.value as number)
      : null;

    const lensMake = tags.LensMake?.value?.[0]
      ? (tags.LensMake.value[0] as string)
      : null;
    const lensModel = tags.LensModel?.value?.[0]
      ? (tags.LensModel.value[0] as string)
      : null;

    const focalLength = formatRational(tags.FocalLength?.value);

    const focalLength35mm = tags.FocalLengthIn35mmFilm?.value
      ? String(tags.FocalLengthIn35mmFilm.value)
      : null;

    const aperture = formatRational(tags.FNumber?.value);

    let shutterSpeed: string | null = null;
    if (tags.ExposureTime?.description) {
      shutterSpeed = tags.ExposureTime.description;
    } else if (tags.ShutterSpeedValue?.description) {
      shutterSpeed = tags.ShutterSpeedValue.description;
    }

    return {
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
      shutterSpeed,
    };
  } catch (error) {
    console.error("EXIFデータの抽出中にエラーが発生しました:", error);
    return {
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
      shutterSpeed: null,
    };
  }
}

/**
 * 環境に応じて公開URLを組み立てる
 * @param fileName - GCS上のファイル名
 */
function buildPublicUrl(fileName: string): string {
  if (process.env.NODE_ENV === "development") {
    return `${process.env.GCS_URL}/${bucketName}/${fileName}`;
  } else {
    return `https://storage.googleapis.com/${bucketName}/${fileName}`;
  }
}
