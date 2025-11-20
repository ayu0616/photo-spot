"use client";

import {
  type InfiniteData,
  type QueryFunctionContext,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import type { PostWithRelationsDto } from "@/dto/post-dto";
import { PostCard } from "./post-card";

const POSTS_PER_PAGE = 10;

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center p-4">
    <Loader2 className="h-6 w-6 animate-spin" />
  </div>
);

// Define the fetch function for TanStack Query
const fetchPostsData = async ({
  pageParam = 0,
}: QueryFunctionContext<string[], number>): Promise<PostWithRelationsDto[]> => {
  const response = await fetch(
    `/api/post?limit=${POSTS_PER_PAGE}&offset=${pageParam * POSTS_PER_PAGE}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return response.json();
};

export const PostList: React.FC = () => {
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery<
    PostWithRelationsDto[],
    Error,
    InfiniteData<PostWithRelationsDto[]>,
    string[],
    number
  >({
    queryKey: ["posts"],
    queryFn: fetchPostsData,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer posts than POSTS_PER_PAGE, it means there are no more pages
      if (lastPage.length < POSTS_PER_PAGE) {
        return undefined;
      }
      // Otherwise, the next page is the current total number of pages
      return allPages.length;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten the pages array into a single array of posts
  const allPosts: PostWithRelationsDto[] = data?.pages.flat() || [];

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 my-8">
        Error loading posts: {error?.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {hasNextPage && (
        <div ref={ref} className="flex justify-center my-8">
          {isFetchingNextPage ? (
            <Spinner />
          ) : (
            <Button
              type="button"
              onClick={() => fetchNextPage()}
              variant="outline"
            >
              Load More
            </Button>
          )}
        </div>
      )}

      {!hasNextPage && allPosts.length > 0 && (
        <p className="text-center text-gray-500 my-8">
          全ての投稿が表示されました。
        </p>
      )}

      {!hasNextPage && allPosts.length === 0 && (
        <p className="text-center text-gray-500 my-8">まだ投稿がありません。</p>
      )}
    </div>
  );
};
