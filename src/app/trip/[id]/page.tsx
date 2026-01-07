import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextAuth]/auth";
import type { PostList as PostListType } from "@/features/post/service";
import { honoClient } from "@/lib/hono";
import { TripDetailView } from "./_components/trip-detail-view";

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
  const userId = session?.user?.id || undefined;

  // Filter posts that are owned by the user and have a photo
  const sharePosts = posts.filter(
    (
      post,
    ): post is PostListType & { photo: NonNullable<PostListType["photo"]> } =>
      post.userId === userId && post.photo !== null,
  );

  return (
    <TripDetailView
      trip={trip}
      posts={posts}
      currentUserId={userId}
      sharePosts={sharePosts}
    />
  );
}
