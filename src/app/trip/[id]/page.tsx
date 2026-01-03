import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextAuth]/auth";
import { PostList } from "@/components/post/post-list";
import { honoClient } from "@/lib/hono";
import { TripShareDialog } from "./_components/trip-share-dialog";

const getTrip = async (id: string) => {
  "use cache";
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
          {userId && sharePosts.length > 0 && (
            <TripShareDialog posts={sharePosts} tripTitle={trip.title} />
          )}
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
