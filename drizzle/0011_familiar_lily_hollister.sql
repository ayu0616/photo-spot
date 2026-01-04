CREATE INDEX "city_master_prefecture_id" ON "city_master" USING btree ("prefecture_id");--> statement-breakpoint
CREATE INDEX "post_trip_id" ON "post" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "post_user_id" ON "post" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "spot_city_id" ON "spot" USING btree ("cityId");--> statement-breakpoint
CREATE INDEX "trip_user_id" ON "trip" USING btree ("userId");