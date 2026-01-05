import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { PhotosTable } from "@/db/schema";

export type Photo = InferSelectModel<typeof PhotosTable>;
export type NewPhoto = InferInsertModel<typeof PhotosTable>;

export async function createPhoto(photo: NewPhoto): Promise<Photo> {
  const [newPhoto] = await db.insert(PhotosTable).values(photo).returning();
  return newPhoto;
}

export async function getPhoto(id: string): Promise<Photo | null> {
  const [photo] = await db
    .select()
    .from(PhotosTable)
    .where(eq(PhotosTable.id, id));
  return photo ?? null;
}
