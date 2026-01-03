import z from "zod";
import { honoServerClient } from "@/lib/hono-server";
import { TripListPage } from "./_components/trip-list-page";

export const tripSearchParamsSchema = z.object({
  year: z.coerce.number().int().positive().default(new Date().getFullYear()),
});

export default async function Page({ searchParams }: PageProps<"/trip">) {
  const { year } = tripSearchParamsSchema.parse(await searchParams);
  if (typeof window !== "undefined") {
    return "";
  }
  const res = await honoServerClient.trip["get-by-year"].$get({
    query: { year: year.toString() },
  });
  if (!res.ok) {
    throw new Error("Internal Server Error");
  }
  const trips = await res.json();
  return <TripListPage trips={trips} year={year} />;
}
