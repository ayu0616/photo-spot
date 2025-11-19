"use client";

import { Loader2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
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

export const PostList: React.FC = () => {
  const [posts, setPosts] = useState<PostWithRelationsDto[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const fetchPosts = useCallback(
    async (pageNumber: number) => {
      if (loading) return;
      setLoading(true);
      try {
        const response = await fetch(
          `/api/post?limit=${POSTS_PER_PAGE}&offset=${
            pageNumber * POSTS_PER_PAGE
          }`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const newPosts: PostWithRelationsDto[] = await response.json();

        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        setHasMore(newPosts.length === POSTS_PER_PAGE);
        setPage((prevPage) => prevPage + 1);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        setHasMore(false); // エラー時はそれ以上読み込まない
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchPosts(page);
    }
  }, [inView, hasMore, loading, page, fetchPosts]);

  // 初回ロード
  useEffect(() => {
    if (posts.length === 0 && !loading && hasMore) {
      fetchPosts(0);
    }
  }, [posts.length, loading, hasMore, fetchPosts]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {hasMore && (
        <div ref={ref} className="flex justify-center my-8">
          {loading ? (
            <Spinner />
          ) : (
            <Button
              type="button"
              onClick={() => fetchPosts(page)}
              variant="outline"
            >
              Load More
            </Button>
          )}
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-gray-500 my-8">
          全ての投稿が表示されました。
        </p>
      )}
    </div>
  );
};
