import { useQuery } from "@tanstack/react-query";
import { fetchCities } from "@/lib/fetcher";

export const useCities = (prefectureId: string | undefined) => {
  return useQuery({
    queryKey: ["cities", prefectureId],
    queryFn: () => fetchCities(prefectureId as string),
    enabled: !!prefectureId, // Only fetch when prefectureId is provided
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
