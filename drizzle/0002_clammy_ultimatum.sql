ALTER TABLE "photo" ADD COLUMN "exif" text;--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "takenAt" timestamp;--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "cameraMake" varchar(255);--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "cameraModel" varchar(255);--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "latitude" varchar(255);--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "longitude" varchar(255);--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "orientation" integer;--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "iso" integer;--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "lensMake" varchar(255);--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "lensModel" varchar(255);--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "lensSerial" varchar(255);--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "focalLength" varchar(255);--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "focalLength35mm" varchar(255);--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "aperture" varchar(255);