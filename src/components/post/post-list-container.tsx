"use client";

import {
  type InfiniteData,
  type QueryFunctionContext,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import type { PostWithRelationsDto } from "@/features/post/PostDto";
import { honoClient } from "@/lib/hono";
import { PostList } from "./post-list"; // Import the presentational component

const POSTS_PER_PAGE = 10;

// Define the fetch function for TanStack Query
const fetchPostsData = async ({
  pageParam = 0,
}: QueryFunctionContext<string[], number>): Promise<PostWithRelationsDto[]> => {
  const response = await honoClient.post.$get({
    query: {
      limit: POSTS_PER_PAGE.toString(),
      offset: (pageParam * POSTS_PER_PAGE).toString(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  const posts = await response.json();
  return posts.map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
    photo: {
      ...post.photo,
      takenAt: post.photo.takenAt ? new Date(post.photo.takenAt) : null,
    },
  }));
};

export const PostListContainer: React.FC = () => {
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
      if (lastPage.length < POSTS_PER_PAGE) {
        return undefined;
      }
      return allPages.length;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPosts: PostWithRelationsDto[] = data?.pages.flat() || [];

  return (
    <PostList
      allPosts={allPosts}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={isLoading}
      isError={isError}
      error={error}
      inViewRef={ref}
    />
  );
};
