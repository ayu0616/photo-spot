import { useQuery } from "@tanstack/react-query";
import { fetchPrefectures } from "@/lib/fetcher";

export const usePrefectures = () => {
  return useQuery({
    queryKey: ["prefectures"],
    queryFn: fetchPrefectures,
    staleTime: 1000 * 60 * 60, // 1 hour - prefectures don't change frequently
  });
};
