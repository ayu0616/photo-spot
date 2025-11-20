import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PostWithRelationsDto } from "@/dto/post-dto";
import { formatToYYYYMMDD } from "@/lib/format-date";

interface PostCardProps {
  post: PostWithRelationsDto;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <Link href={`/post/${post.id}`}>
      <Card className="w-full max-w-sm cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage
                src={post.user.image || undefined}
                alt={post.user.name || "User Avatar"}
              />
              <AvatarFallback>
                {post.user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <CardTitle>{post.user.name || "匿名ユーザー"}</CardTitle>
              <CardDescription>
                {formatToYYYYMMDD(new Date(post.createdAt))}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-square w-full">
            <Image
              src={post.photo.url}
              alt={post.description || "Post Image"}
              fill
              className="rounded-md object-cover"
            />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {post.description}
          </p>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-gray-500">📍 {post.spot.name}</p>
        </CardFooter>
      </Card>
    </Link>
  );
};
