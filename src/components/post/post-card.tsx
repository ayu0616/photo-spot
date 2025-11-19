// src/components/post/post-card.tsx

import Image from "next/image";
import type React from "react";
import type { PostWithRelationsDto } from "@/dto/post-dto";

interface PostCardProps {
  post: PostWithRelationsDto;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex items-center gap-2">
          {/* User Avatar */}
          <div className="relative h-8 w-8 rounded-full bg-gray-200">
            {post.user.image && (
              <Image
                src={post.user.image}
                alt={post.user.name || "User Avatar"}
                fill
                className="rounded-full object-cover"
              />
            )}
          </div>
          {/* User Name */}
          <p className="text-sm font-semibold">
            {post.user.name || "匿名ユーザー"}
          </p>
        </div>
      </div>
      {/* Post Image */}
      <div className="relative aspect-square w-full">
        <Image
          src={post.photo.url}
          alt={post.description || "Post Image"}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-6">
        {/* Post Description */}
        <p className="text-sm text-muted-foreground mb-2">{post.description}</p>
        {/* Spot Name */}
        <p className="text-xs text-gray-500">{post.spot.name}</p>
        {/* Created At */}
        <p className="text-xs text-gray-500">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
