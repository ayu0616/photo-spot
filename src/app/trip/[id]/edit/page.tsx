import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextAuth]/auth";
import { formatToYYYYMMDD } from "@/lib/format-date";
import { honoClient } from "@/lib/hono";
import EditTripForm from "./edit-trip-form";

interface PostSummary {
  id: string;
  spot: { name: string };
  photo: {
    takenAt: string | null;
    url: string;
  };
}

interface Trip {
  id: string;
  title: string;
  description: string | null;
  startedAt: string | null;
  endedAt: string | null;
  posts: PostSummary[];
  userId: string;
}

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const tripRes = await honoClient.trip[":id"].$get({ param: { id } });

  if (!tripRes.ok) {
    if (tripRes.status === 404) {
      notFound();
    }
    throw new Error("Failed to fetch trip data");
  }

  const tripData = (await tripRes.json()) as Trip;

  if (tripData.userId !== session.user.id) {
    notFound();
  }

  let initialPosts: PostSummary[] = [];

  const fromDate = tripData.startedAt
    ? formatToYYYYMMDD(new Date(tripData.startedAt))
    : undefined;
  const toDate = tripData.endedAt
    ? formatToYYYYMMDD(new Date(tripData.endedAt))
    : undefined;

  const postsRes = await honoClient.post["for-trip-edit"].$get({
    query: {
      from: fromDate,
      to: toDate,
      tripId: id,
    },
  });

  if (postsRes.ok) {
    initialPosts = (await postsRes.json()) as PostSummary[];
  }

  return <EditTripForm trip={tripData} initialPosts={initialPosts} />;
}
