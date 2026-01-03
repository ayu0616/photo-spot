import { relations } from "drizzle-orm";
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
  role: varchar("role", { length: 20 }).default("USER").notNull(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  posts: many(PostsTable),
  accounts: many(accountsTable),
  sessions: many(sessionsTable),
  authenticators: many(authenticatorsTable),
}));

export const PrefectureMasterTable = pgTable("prefecture_master", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const prefectureMasterRelations = relations(
  PrefectureMasterTable,
  ({ many }) => ({
    cities: many(CityMasterTable),
  }),
);

export const CityMasterTable = pgTable("city_master", {
  id: integer("id").primaryKey(),
  prefectureId: integer("prefecture_id")
    .notNull()
    .references(() => PrefectureMasterTable.id),
  name: varchar("name", { length: 255 }).notNull(),
});

export const cityMasterRelations = relations(
  CityMasterTable,
  ({ one, many }) => ({
    prefecture: one(PrefectureMasterTable, {
      fields: [CityMasterTable.prefectureId],
      references: [PrefectureMasterTable.id],
    }),
    spots: many(SpotsTable),
  }),
);

export const SpotsTable = pgTable("spot", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  cityId: integer("cityId")
    .notNull()
    .references(() => CityMasterTable.id),
});

export const spotsRelations = relations(SpotsTable, ({ one, many }) => ({
  city: one(CityMasterTable, {
    fields: [SpotsTable.cityId],
    references: [CityMasterTable.id],
  }),
  posts: many(PostsTable),
}));

export const PhotosTable = pgTable("photo", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  /**
   * 写真URL（外部ストレージのパス）
   */
  url: varchar("url", { length: 255 }).notNull(),

  // --- 共通のパース済み EXIF フィールド ---
  /** 撮影日時 */
  takenAt: timestamp("takenAt", { mode: "date", withTimezone: true }),
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
  /** シャッタースピード（例: 1/250, 1s などをそのまま保存） */
  shutterSpeed: varchar("shutterSpeed", { length: 255 }),
});

export const photosRelations = relations(PhotosTable, ({ one }) => ({
  post: one(PostsTable, {
    fields: [PhotosTable.id],
    references: [PostsTable.photoId],
  }),
}));

export const TripsTable = pgTable("trip", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }),
  startedAt: varchar("startedAt", { length: 10 }), // YYYY-MM-DD
  endedAt: varchar("endedAt", { length: 10 }), // YYYY-MM-DD
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
});

export const tripsRelations = relations(TripsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [TripsTable.userId],
    references: [usersTable.id],
  }),
  posts: many(PostsTable),
}));

export const PostsTable = pgTable("post", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 255 }).notNull(),
  spotId: varchar("spot_id", { length: 255 }) // Renamed from 'id' to 'spot_id'
    .notNull()
    .references(() => SpotsTable.id, { onDelete: "cascade" }), // Added onDelete
  photoId: varchar("photo_id", { length: 255 }) // Renamed from 'photoId' to 'photo_id'
    .notNull()
    .references(() => PhotosTable.id, { onDelete: "cascade" }), // Added onDelete
  tripId: varchar("trip_id", { length: 255 }).references(() => TripsTable.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
});

export const postsRelations = relations(PostsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [PostsTable.userId],
    references: [usersTable.id],
  }),
  spot: one(SpotsTable, {
    fields: [PostsTable.spotId],
    references: [SpotsTable.id],
  }),
  photo: one(PhotosTable, {
    fields: [PostsTable.photoId],
    references: [PhotosTable.id],
  }),
  trip: one(TripsTable, {
    fields: [PostsTable.tripId],
    references: [TripsTable.id],
  }),
}));

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

export const accountsRelations = relations(accountsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id],
  }),
}));

export const sessionsTable = pgTable("session", {
  sessionToken: varchar("sessionToken", { length: 255 }).primaryKey(),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));

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

export const authenticatorsRelations = relations(
  authenticatorsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [authenticatorsTable.userId],
      references: [usersTable.id],
    }),
  }),
);
