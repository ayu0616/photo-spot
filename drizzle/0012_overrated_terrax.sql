CREATE TYPE "public"."post_type" AS ENUM('PHOTO', 'NOTE');--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "spot_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "photo_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "type" "post_type" DEFAULT 'PHOTO' NOT NULL;