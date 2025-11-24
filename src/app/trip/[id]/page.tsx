import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { formatToYYYYMMDD } from "@/lib/format-date";
import { honoClient } from "@/lib/hono";
import { TripScroller } from "./_components/trip-scroller";

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

export default async function TripPage({
  params,
  searchParams,
}: PageProps<"/trip/[id]">) {
  const { id } = await params;
  const { postId: rawPostId } = await searchParams;
  const postId = Array.isArray(rawPostId) ? rawPostId[0] : rawPostId;

  const trip = await getTrip(id);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TripScroller postId={postId}>
          {trip.posts.map((post) => (
            <Link
              href={`/post/${post.id}`}
              key={post.id}
              className="block group"
            >
              <Card
                id={post.id}
                className="h-full overflow-hidden transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-video">
                  <Image
                    src={post.photo.url}
                    alt={post.description || "Post Image"}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 truncate">
                      {post.spot.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {formatToYYYYMMDD(new Date(post.createdAt))}
                  </p>
                  {post.description && (
                    <p className="text-sm line-clamp-2">{post.description}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </TripScroller>
        {!trip.posts.length && (
          <p className="text-gray-500 col-span-full text-center py-10">
            No posts in this trip yet.
          </p>
        )}
      </div>
    </div>
  );
}
