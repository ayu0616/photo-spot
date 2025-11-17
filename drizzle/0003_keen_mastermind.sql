ALTER TABLE "post" DROP CONSTRAINT "post_id_spot_id_fk";
--> statement-breakpoint
ALTER TABLE "post" DROP CONSTRAINT "post_photoId_photo_id_fk";
--> statement-breakpoint
ALTER TABLE "post" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "spot_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "photo_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_spot_id_spot_id_fk" FOREIGN KEY ("spot_id") REFERENCES "public"."spot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_photo_id_photo_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" DROP COLUMN "photoId";