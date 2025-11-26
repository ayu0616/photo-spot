import { eq } from "drizzle-orm";
import { injectable } from "inversify";
import { db } from "../../db";
import { CityMasterTable, PrefectureMasterTable } from "../../db/schema";

@injectable()
export class MasterRepository {
  async findAllPrefectures(): Promise<Array<{ id: number; name: string }>> {
    return await db.select().from(PrefectureMasterTable);
  }

  async findCitiesByPrefectureId(
    prefectureId: number,
  ): Promise<Array<{ id: number; name: string; prefectureId: number }>> {
    return await db
      .select()
      .from(CityMasterTable)
      .where(eq(CityMasterTable.prefectureId, prefectureId));
  }
}
