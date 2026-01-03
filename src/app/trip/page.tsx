import z from "zod";
import { honoServerClient } from "@/lib/hono-server";

const searchParamsSchema = z.object({
  year: z.coerce.number().int().positive().default(new Date().getFullYear()),
});

export default async function Page({ searchParams }: PageProps<"/trip">) {
  const { year } = searchParamsSchema.parse(await searchParams);
  const res = await honoServerClient.trip["get-by-year"].$get({
    query: { year: year.toString() },
  });
  if (!res.ok) {
    throw new Error("Internal Server Error");
  }
  const trips = await res.json();
  return <>{JSON.stringify(trips)}</>;
}
