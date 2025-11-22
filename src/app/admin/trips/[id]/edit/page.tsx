"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { honoClient } from "@/lib/hono";

export default function EditTripPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaultValues, setDefaultValues] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    async function fetchTrip() {
      try {
        const res = await honoClient.trip[":id"].$get({
          param: { id },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch trip");
        }
        const trip = await res.json();
        setDefaultValues({
          title: trip.title,
          description: trip.description || "",
        });
      } catch (e) {
        setError("Failed to load trip details.");
        console.error(e);
      } finally {
        setIsFetching(false);
      }
    }
    fetchTrip();
  }, [id]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    try {
      const res = await honoClient.trip[":id"].$put({
        param: { id },
        json: {
          title,
          description,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to update trip");
      }

      router.push("/admin/trips");
      router.refresh();
    } catch (e) {
      setError("Failed to update trip. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function onDelete() {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    setIsLoading(true);
    try {
      const res = await honoClient.trip[":id"].$delete({
        param: { id },
      });

      if (!res.ok) {
        throw new Error("Failed to delete trip");
      }

      router.push("/admin/trips");
      router.refresh();
    } catch (e) {
      setError("Failed to delete trip. Please try again.");
      console.error(e);
      setIsLoading(false);
    }
  }

  if (isFetching)
    return <div className="container mx-auto py-10">Loading...</div>;
  if (!defaultValues)
    return <div className="container mx-auto py-10">Trip not found</div>;

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Trip</CardTitle>
          <CardDescription>Update trip details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={defaultValues.title}
                placeholder="Trip Title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={defaultValues.description}
                placeholder="Trip Description"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={isLoading}
              >
                Delete Trip
              </Button>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Trip"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
