"use client";

import { Loader2 } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import type { PostWithRelationsDto } from "@/features/post/PostDto";
import { PostCard } from "./post-card";

interface PostListProps {
  allPosts: PostWithRelationsDto[];
  fetchNextPage?: () => Promise<unknown>;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  inViewRef?: (node?: Element | null) => void;
}

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center p-4">
    <Loader2 className="h-6 w-6 animate-spin" />
  </div>
);

export const PostList: React.FC<PostListProps> = ({
  allPosts,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  isError,
  error,
  inViewRef,
}) => {
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
    <div className="container mx-auto px-2 py-4 md:px-4 md:py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {hasNextPage && fetchNextPage && inViewRef && (
        <div ref={inViewRef} className="flex justify-center my-8">
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
