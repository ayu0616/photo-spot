import { desc } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("user", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: varchar("image", { length: 255 }),
});

export const accountsTable = pgTable(
  "account",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessionsTable = pgTable("session", {
  sessionToken: varchar("sessionToken", { length: 255 }).primaryKey(),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokensTable = pgTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
);

export const authenticatorsTable = pgTable(
  "authenticator",
  {
    credentialID: varchar("credentialID", { length: 255 }).notNull().unique(),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    credentialPublicKey: varchar("credentialPublicKey", {
      length: 255,
    }).notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: varchar("credentialDeviceType", {
      length: 255,
    }).notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: varchar("transports", { length: 255 }),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  }),
);

export const PostsTable = pgTable("post", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 255 }).notNull(),
  spotId: varchar("id", { length: 255 })
    .notNull()
    .references(() => SpotsTable.id),
  photoId: varchar("photoId", { length: 255 })
    .notNull()
    .references(() => PhotosTable.id),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
});

export const PhotosTable = pgTable("photo", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  /**
   * 写真URL（外部ストレージのパス）
   */
  url: varchar("url", { length: 255 }).notNull(),

  /**
   * 生の EXIF 情報を JSON 文字列として保存します。
   * 必要に応じてパースして個別フィールドにも格納します。
   */
  exif: text("exif"),

  // --- 共通のパース済み EXIF フィールド ---
  /** 撮影日時 */
  takenAt: timestamp("takenAt", { mode: "date" }),
  /** カメラメーカー（例: Nikon, Canon） */
  cameraMake: varchar("cameraMake", { length: 255 }),
  /** カメラモデル（例: EOS R5） */
  cameraModel: varchar("cameraModel", { length: 255 }),
  /** 緯度（文字列で保存、必要に応じて数値に変換） */
  latitude: varchar("latitude", { length: 255 }),
  /** 経度（文字列で保存、必要に応じて数値に変換） */
  longitude: varchar("longitude", { length: 255 }),
  /** 画像の向き（EXIF Orientation） */
  orientation: integer("orientation"),
  /** ISO 感度 */
  iso: integer("iso"),

  // --- レンズ関連フィールド ---
  /** レンズメーカー（例: Sigma） */
  lensMake: varchar("lensMake", { length: 255 }),
  /** レンズモデル（例: 50mm F1.4） */
  lensModel: varchar("lensModel", { length: 255 }),
  /** レンズのシリアル番号（存在する場合） */
  lensSerial: varchar("lensSerial", { length: 255 }),
  /** 焦点距離（EXIF のまま文字列で保存） */
  focalLength: varchar("focalLength", { length: 255 }),
  /** 35mm 換算の焦点距離（EXIF のまま文字列で保存） */
  focalLength35mm: varchar("focalLength35mm", { length: 255 }),
  /** 絞り値（例: f/1.8 をそのまま保存） */
  aperture: varchar("aperture", { length: 255 }),
});

export const SpotsTable = pgTable("spot", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  cityId: integer("cityId")
    .notNull()
    .references(() => CityMasterTable.id),
});

export const PrefectureMasterTable = pgTable("prefecture_master", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const CityMasterTable = pgTable("city_master", {
  id: integer("id").primaryKey(),
  prefectureId: integer("prefecture_id")
    .notNull()
    .references(() => PrefectureMasterTable.id),
  name: varchar("name", { length: 255 }).notNull(),
});
