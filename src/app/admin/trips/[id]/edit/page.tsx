"use client";

import Image from "next/image";
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

interface PostSummary {
  id: string;
  spot: { name: string };
  createdAt: string;
  photo: { url: string };
}

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
  const [allPosts, setAllPosts] = useState<PostSummary[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tripRes, postsRes] = await Promise.all([
          honoClient.trip[":id"].$get({ param: { id } }),
          honoClient.post.all.$get(),
        ]);

        if (!tripRes.ok) throw new Error("Failed to fetch trip");
        if (!postsRes.ok) throw new Error("Failed to fetch posts");

        const trip = await tripRes.json();
        const posts = await postsRes.json();

        setDefaultValues({
          title: trip.title,
          description: trip.description || "",
        });
        setAllPosts(posts);

        if (trip.posts) {
          setSelectedPostIds(trip.posts.map((p: any) => p.id));
        }
      } catch (e) {
        setError("Failed to load data.");
        console.error(e);
      } finally {
        setIsFetching(false);
      }
    }
    fetchData();
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
          postIds: selectedPostIds,
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

  const togglePostSelection = (postId: string) => {
    setSelectedPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId],
    );
  };

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

            <div className="space-y-2">
              <Label>Select Posts</Label>
              <div className="grid grid-cols-2 gap-4 border p-4 rounded-md max-h-96 overflow-y-auto">
                {allPosts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    className={`flex items-start space-x-2 p-2 rounded border cursor-pointer hover:bg-gray-50 text-left w-full ${
                      selectedPostIds.includes(post.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => togglePostSelection(post.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPostIds.includes(post.id)}
                      onChange={() => {}} // Handled by button click
                      className="mt-1 pointer-events-none"
                    />
                    <div className="text-sm w-full">
                      <p className="font-medium truncate">{post.spot.name}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                      {post.photo?.url && (
                        <div className="relative w-full h-24 mt-1">
                          <Image
                            src={post.photo.url}
                            alt="Post"
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
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
