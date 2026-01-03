/**
 * 画像URLを読み込み、正方形に加工してシェア用のFileオブジェクトを返します。
 * 正方形でない部分は背景色 (#f8fafc) で埋められます。
 */
export async function createSquareImageFile(
  imageUrl: string,
  fileName: string,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // CORS対策
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // 正方形のサイズ（長辺に合わせる）
      const size = Math.max(img.width, img.height);
      canvas.width = size;
      canvas.height = size;

      // 背景色で塗りつぶし
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, size, size);

      // 中央に配置
      const x = (size - img.width) / 2;
      const y = (size - img.height) / 2;
      ctx.drawImage(img, x, y);

      // Blobに変換
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob"));
            return;
          }
          const file = new File([blob], fileName, { type: "image/jpeg" });
          resolve(file);
        },
        "image/jpeg",
        0.9,
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
}
