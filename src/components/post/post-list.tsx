"use client";

import { Loader2, NotebookPen } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import type { PostList as PostListType } from "@/features/post/service";
import { formatDateTime } from "@/lib/format-date";
import { PostCard } from "./post-card";

interface PostListProps {
  allPosts: PostListType[];
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-8">
        {allPosts.map((post) => (
          <div key={post.id} className="relative pl-8">
            {/* タイムラインのドット */}
            {post.type === "NOTE" ? (
              <div className="absolute -left-[13px] top-6 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-slate-600 shadow-sm dark:border-slate-900">
                <NotebookPen className="w-3 h-3" />
              </div>
            ) : (
              <div className="absolute -left-[11px] top-6 h-5 w-5 rounded-full border-4 border-white bg-primary shadow-sm dark:border-slate-900" />
            )}

            {/* 日時表示 */}
            <div className="mb-3 text-xs font-medium text-muted-foreground flex items-center gap-2">
              <span className="bg-muted px-2 py-0.5 rounded">
                {post.takenAt
                  ? formatDateTime(new Date(post.takenAt))
                  : formatDateTime(new Date(post.createdAt))}
              </span>
            </div>

            {/* カード本体 */}
            <div className="transition-transform hover:scale-[1.01] active:scale-[0.99]">
              <PostCard post={post} />
            </div>
          </div>
        ))}

        {hasNextPage && fetchNextPage && inViewRef && (
          <div ref={inViewRef} className="flex justify-center pt-8">
            {isFetchingNextPage ? (
              <Spinner />
            ) : (
              <Button
                type="button"
                onClick={() => fetchNextPage()}
                variant="outline"
                className="rounded-full px-8"
              >
                もっと見る
              </Button>
            )}
          </div>
        )}
      </div>

      {!hasNextPage && allPosts.length > 0 && (
        <p className="text-center text-sm text-muted-foreground my-8">
          全ての投稿が表示されました。
        </p>
      )}

      {!hasNextPage && allPosts.length === 0 && (
        <p className="text-center text-sm text-muted-foreground my-8">
          まだ投稿がありません。
        </p>
      )}
    </div>
  );
};
