import { notFound } from "next/navigation";
import { formatToYYYYMMDD } from "@/lib/format-date";
import { honoClient } from "@/lib/hono";
import EditTripForm from "./edit-trip-form";

interface PostSummary {
  id: string;
  spot: { name: string };
  createdAt: string;
  photo: { url: string };
}

interface Trip {
  id: string;
  title: string;
  description: string | null;
  startedAt: string | null;
  endedAt: string | null;
  posts: PostSummary[];
}

export default async function EditTripPage({
  params,
}: PageProps<"/admin/trips/[id]/edit">) {
  const { id } = await params;

  const tripRes = await honoClient.trip[":id"].$get({ param: { id } });

  if (!tripRes.ok) {
    if (tripRes.status === 404) {
      notFound();
    }
    throw new Error("Failed to fetch trip data");
  }

  const tripData = (await tripRes.json()) as Trip;

  let initialPosts: PostSummary[] = [];

  const fromDate = tripData.startedAt
    ? formatToYYYYMMDD(new Date(tripData.startedAt))
    : undefined;
  const toDate = tripData.endedAt
    ? formatToYYYYMMDD(new Date(tripData.endedAt))
    : undefined;

  const postsRes = await honoClient.post.query.$get({
    query: {
      from: fromDate,
      to: toDate,
    },
  });

  if (postsRes.ok) {
    initialPosts = (await postsRes.json()) as PostSummary[];
  }

  // クライアントコンポーネントへデータを渡す
  return <EditTripForm trip={tripData} initialPosts={initialPosts} />;
}
