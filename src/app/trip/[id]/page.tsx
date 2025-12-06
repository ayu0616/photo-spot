import { notFound } from "next/navigation";
import { PostList } from "@/components/post/post-list";
import { formatToYYYYMMDD } from "@/lib/format-date";
import { honoClient } from "@/lib/hono";

const getTrip = async (id: string) => {
  "use cache";
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
  const { id } = await params;

  const trip = await getTrip(id);

  const postsWithDateObjects = trip.posts.map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
    photo: {
      ...post.photo,
      takenAt: post.photo.takenAt ? new Date(post.photo.takenAt) : null,
    },
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{trip.title}</h1>
        {trip.description && (
          <p className="text-gray-600">{trip.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          {formatToYYYYMMDD(new Date(trip.createdAt))}
        </p>
      </div>

      <PostList allPosts={postsWithDateObjects} />
    </div>
  );
}
