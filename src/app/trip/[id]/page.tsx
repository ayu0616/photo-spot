import { Edit } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextAuth]/auth";
import { PostList } from "@/components/post/post-list";
import { Button } from "@/components/ui/button";
import type { PostList as PostListType } from "@/features/post/service";
import { honoClient } from "@/lib/hono";
import { TripShareDialog } from "./_components/trip-share-dialog";

export const getTripCacheTag = (id: string) => `trip-details-${id}`;

interface TripDetail {
  id: string;
  title: string;
  description: string | null;
  startedAt: string | null;
  endedAt: string | null;
  userId: string;
  posts: PostListType[];
}

const getTrip = async (id: string): Promise<TripDetail> => {
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

  // Cast because Hono client inference might be tricky with complex relations or I'm lazy
  return (await res.json()) as unknown as TripDetail;
};

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const trip = await getTrip((await params).id);

  const posts = trip.posts.map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
    photo: post.photo
      ? {
          ...post.photo,
          takenAt: post.photo.takenAt ? new Date(post.photo.takenAt) : null,
        }
      : null,
  })) as PostListType[];

  const session = await auth();
  const userId = session?.user.id;

  // Filter posts that are owned by the user and have a photo
  const sharePosts = posts.filter(
    (
      post,
    ): post is PostListType & { photo: NonNullable<PostListType["photo"]> } =>
      post.userId === userId && post.photo !== null,
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h1 className="text-3xl font-bold">{trip.title}</h1>
          <div className="flex gap-2">
            {userId === trip.userId && (
              <Button variant="outline" size="icon" asChild>
                {/* biome-ignore lint/suspicious/noExplicitAny: Route inference issue */}
                <Link href={`/trip/${trip.id}/edit` as any}>
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
