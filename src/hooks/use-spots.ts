import { useQuery } from "@tanstack/react-query";
import { fetchSpots } from "@/lib/fetcher";

export const useSpots = (enabled = true) => {
  return useQuery({
    queryKey: ["spots"],
    queryFn: fetchSpots,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
