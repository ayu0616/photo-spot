import { Edit } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextAuth]/auth";
import { PostList } from "@/components/post/post-list";
import { Button } from "@/components/ui/button";
import { honoClient } from "@/lib/hono";
import { TripShareDialog } from "./_components/trip-share-dialog";

export const getTripCacheTag = (id: string) => `trip-details-${id}`;

const getTrip = async (id: string) => {
  "use cache";
  cacheTag(getTripCacheTag(id));
  cacheLife("minutes");

  const res = await honoClient.trip[":id"].$get({
    param: { id },
  });

  if (res.status === 404) {
    notFound();
  }
  if (!res.ok) {
    throw new Error("Failed to fetch trip");
  }

  return res.json();
};

export default async function TripPage({ params }: PageProps<"/trip/[id]">) {
  const trip = await getTrip((await params).id);

  const posts = trip.posts.map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
    photo: {
      ...post.photo,
      takenAt: post.photo.takenAt ? new Date(post.photo.takenAt) : null,
    },
  }));

  const session = await auth();
  const userId = session?.user.id;

  const sharePosts = posts.filter((post) => post.userId === userId);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h1 className="text-3xl font-bold">{trip.title}</h1>
          <div className="flex gap-2">
            {userId === trip.userId && (
              <Button variant="outline" size="icon" asChild>
                <Link href={`/trip/${trip.id}/edit`}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">編集</span>
                </Link>
              </Button>
            )}
            {userId && sharePosts.length > 0 && (
              <TripShareDialog posts={sharePosts} tripTitle={trip.title} />
            )}
          </div>
        </div>
        {trip.description && (
          <p className="text-gray-600 mb-2">{trip.description}</p>
        )}
        <p className="text-sm text-gray-500">
          {trip.startedAt} - {trip.endedAt}
        </p>
      </div>
      <PostList allPosts={posts} />
    </div>
  );
}
