export const formatAperture = (value: string | null | undefined): string => {
  if (value === null || value === undefined) {
    return "-";
  }
  // If it's already in f/X format, return as is
  if (value.startsWith("f/")) {
    return value;
  }

  // Handle fractional values like "9/2"
  if (value.includes("/")) {
    const parts = value.split("/");
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      if (
        !Number.isNaN(numerator) &&
        !Number.isNaN(denominator) &&
        denominator !== 0
      ) {
        const result = numerator / denominator;
        return `f/${result.toFixed(1)}`;
      }
    }
  }

  // Try to parse as a number and format
  const num = parseFloat(value);
  if (!Number.isNaN(num)) {
    return `f/${num.toFixed(1)}`; // Format to one decimal place
  }
  return value; // Return original if not parsable
};

export const formatFocalLength = (value: string | null | undefined): string => {
  if (value === null || value === undefined) {
    return "-";
  }
  // If it already contains "mm", return as is
  if (value.includes("mm")) {
    return value;
  }

  // Handle fractional values like "6249513/1000000"
  if (value.includes("/")) {
    const parts = value.split("/");
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      if (
        !Number.isNaN(numerator) &&
        !Number.isNaN(denominator) &&
        denominator !== 0
      ) {
        const result = numerator / denominator;
        // Format to max 2 decimal places, removing trailing zeros if integer
        return `${parseFloat(result.toFixed(2))}mm`;
      }
    }
  }

  // Try to parse as a number and add "mm"
  const num = parseFloat(value);
  if (!Number.isNaN(num)) {
    return `${num}mm`;
  }
  return value; // Return original if not parsable
};

export const formatISO = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "-";
  }
  return `ISO ${value}`;
};

export const formatShutterSpeed = (
  value: string | null | undefined,
): string => {
  if (value === null || value === undefined) {
    return "-";
  }
  // Assuming shutter speed might come as a decimal (e.g., 0.004) or fraction (e.g., 1/250)
  // Convert decimal to fraction if it's less than 1 and has many decimal places
  const num = parseFloat(value);
  if (!Number.isNaN(num) && num < 1 && num > 0) {
    // Attempt to convert to a common fraction like 1/X
    const reciprocal = 1 / num;
    if (Number.isInteger(reciprocal)) {
      return `1/${reciprocal}`;
    }
  }
  return value;
};

// This is a placeholder for more advanced GPS formatting if needed
export const formatGPSCoordinate = (
  value: string | null | undefined,
): string => {
  if (value === null || value === undefined) {
    return "-";
  }
  return value;
};

/**
 * 数字をローマ数字に変換するヘルパー関数 (1~10程度を想定)
 */
function toRoman(num: number): string {
  const romans: Record<number, string> = {
    1: "", // 初代は何もつけないことが多いが、明示的に I をつけるなら 'I'
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
    7: "VII",
  };
  return romans[num] || String(num); // 定義外は数字のまま返す
}

/**
 * ソニーカメラの型番(Model ID)を一般的な製品名に変換する
 * 例: "ILCE-7CM2" -> "α7C II"
 */
export function convertCameraModelName(
  modelId: string | null | undefined,
): string {
  if (!modelId || !modelId.trim()) return "Unknown Camera";

  // 1. 入力を正規化（トリミング・大文字化）
  const id = modelId.trim().toUpperCase();

  // 2. 特殊なケースや規則に当てはまらないモデルの定義（例外リスト）
  const overrides: Record<string, string> = {
    "ILCE-1": "Sony α1", // Mがつかないフラッグシップ
    "ILCE-9": "Sony α9", // 初代α9
    "ILCE-QX1": "Sony ILCE-QX1", // レンズスタイルカメラ
    "ZV-E1": "Sony VLOGCAM ZV-E1",
    "ZV-E10": "Sony VLOGCAM ZV-E10",
    "ZV-E10M2": "Sony VLOGCAM ZV-E10 II",
    "ILME-FX3": "Sony FX3", // Cinema Line
    "ILME-FX30": "Sony FX30",
  };

  if (overrides[id]) {
    return overrides[id];
  }

  // 3. 一般的なEマウント機 (ILCE) の解析ロジック
  // 正規表現: ILCE- + {モデル名} + {M + 世代番号(任意)}
  const ilceRegex = /^ILCE-([A-Z0-9]+?)(M(\d+))?$/;
  const match = id.match(ilceRegex);

  if (match) {
    const baseName = match[1]; // 例: "7C", "7", "6700"
    const generationStr = match[3]; // 例: "2", "3" (Mの後ろの数字)

    let displayName = `Sony α${baseName}`;

    // 世代番号がある場合（M2, M3...）はローマ数字に変換して付与
    if (generationStr) {
      const genNum = parseInt(generationStr, 10);
      const roman = toRoman(genNum);
      if (roman) {
        displayName += ` ${roman}`;
      }
    }

    return displayName;
  }

  // 4. マッチしない場合はトリミングしてそのまま返す
  return modelId.trim();
}
