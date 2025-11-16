CREATE TABLE "city_master" (
	"id" integer PRIMARY KEY NOT NULL,
	"prefecture_id" integer NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photo" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"url" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" varchar(255) NOT NULL,
	"userId" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"photoId" varchar(255) NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prefecture_master" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spot" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"cityId" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "city_master" ADD CONSTRAINT "city_master_prefecture_id_prefecture_master_id_fk" FOREIGN KEY ("prefecture_id") REFERENCES "public"."prefecture_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_id_spot_id_fk" FOREIGN KEY ("id") REFERENCES "public"."spot"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_photoId_photo_id_fk" FOREIGN KEY ("photoId") REFERENCES "public"."photo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spot" ADD CONSTRAINT "spot_cityId_city_master_id_fk" FOREIGN KEY ("cityId") REFERENCES "public"."city_master"("id") ON DELETE no action ON UPDATE no action;