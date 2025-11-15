import {
  type Bucket,
  Storage,
  type StorageOptions,
} from "@google-cloud/storage";

const bucketName = process.env.GCS_BUCKET_NAME || "";
if (!bucketName) {
  throw new Error("GCS_BUCKET_NAMEの環境変数が設定されていません。");
}

let storage: Storage;

// 開発環境では fake-gcs-server を利用する
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  console.log("🛠️ 開発モード: fake-gcs-server に接続します。");
  const storageOptions: StorageOptions = {
    apiEndpoint: process.env.GCS_URL,
    projectId: "your-dummy-project-id", // fake-gcs-serverでは任意の文字列でOK
  };
  storage = new Storage(storageOptions);
} else {
  // 本番環境などでは通常のGCSに接続
  console.log("🚀 本番モード: Google Cloud Storage に接続します。");
  storage = new Storage();
}

// アプリケーション全体で利用するバケットインスタンス
export const bucket: Bucket = storage.bucket(bucketName);
