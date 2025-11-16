import * as fs from "fs";
import * as path from "path";
import { db } from "./"; // DB接続インスタンスをインポート
import { PrefectureMasterTable, CityMasterTable } from "./schema"; // スキーマをインポート

// --- 設定項目 ---
// 読み込むCSVファイル名を指定してください
const INPUT_CSV_PATH = path.join(
  path.dirname(__filename),
  "data/pref-city-master.csv",
);
// --- 設定項目ここまで ---

/**
 * シンプルなCSVパーサー（自作）
 * CSV文字列を受け取り、オブジェクトの配列を返します。
 * - 1行目のヘッダーはスキップします。
 * - 各行をカンマで分割します。
 * - 各値からダブルクォーテーションを除去します。
 * @param csvContent CSVファイルの全文字列
 * @returns パースされたデータの配列
 */
function parseCsv(
  csvContent: string,
): { id: string; prefName: string; cityName: string }[] {
  const records = [];
  // 1. 改行コードで各行に分割
  const lines = csvContent.split(/\r?\n/);

  // 2. ヘッダー行をスキップし、2行目からループ処理
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // 空行は無視
    if (!line.trim()) {
      continue;
    }

    // 3. 各行をカンマで列に分割
    const columns = line.split(",");

    // 4. 必要な列（最低3列）があることを確認
    if (columns.length >= 3) {
      // 5. 各値からダブルクォーテーションを削除
      const id = columns[0].replace(/"/g, "");
      const prefName = columns[1].replace(/"/g, "");
      const cityName = columns[2].replace(/"/g, "");

      records.push({ id, prefName, cityName });
    }
  }
  return records;
}

/**
 * メインのシーディング処理
 */
async function main() {
  console.log("データベースへのシーディング処理を開始します...");

  try {
    // 1. CSVファイルを読み込み
    if (!fs.existsSync(INPUT_CSV_PATH)) {
      console.error(
        `❌ エラー: CSVファイルが見つかりません。パスを確認してください: ${path.resolve(INPUT_CSV_PATH)}`,
      );
      process.exit(1);
    }
    const csvFile = fs.readFileSync(INPUT_CSV_PATH, "utf8");

    // 2. CSVをパース
    const records: { id: string; prefName: string; cityName: string }[] =
      parseCsv(csvFile);

    // 3. 都道府県データと市区町村データを準備
    const prefectureMap = new Map<number, string>();
    const cities: { id: number; prefectureId: number; name: string }[] = [];

    for (const record of records) {
      if (!record.id || !record.prefName) continue;

      const prefId = parseInt(record.id.substring(0, 2), 10);

      if (!prefectureMap.has(prefId)) {
        prefectureMap.set(prefId, record.prefName);
      }

      if (record.cityName) {
        cities.push({
          id: parseInt(record.id, 10),
          prefectureId: prefId,
          name: record.cityName,
        });
      }
    }

    const prefectures = Array.from(prefectureMap.entries()).map(
      ([id, name]) => ({ id, name }),
    );

    // 4. データベースにデータを挿入
    console.log(`都道府県データを ${prefectures.length} 件挿入します...`);
    await db
      .insert(PrefectureMasterTable)
      .values(prefectures)
      // 同じIDが存在する場合は何もしない (スクリプトを再実行可能にするため)
      .onConflictDoNothing();

    console.log(`市区町村データを ${cities.length} 件挿入します...`);
    // 大量データの場合はチャンクに分割することを推奨しますが、今回は一括で挿入します
    await db.insert(CityMasterTable).values(cities).onConflictDoNothing();

    console.log("✅ シーディング処理が正常に完了しました。");
  } catch (error) {
    console.error("❌ シーディング処理中にエラーが発生しました:", error);
    process.exit(1);
  }
}

// スクリプトを実行
main();
