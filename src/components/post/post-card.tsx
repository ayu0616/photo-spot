import { MapPin } from "lucide-react";
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
import type { PostWithRelationsDto } from "@/features/post/PostDto";
import { formatToYYYYMMDD } from "@/lib/format-date";

interface PostCardProps {
  post: PostWithRelationsDto;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <Link href={`/post/${post.id}`} className="block h-full">
      <Card
        className="w-full cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col"
        id={post.id}
      >
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
            <div className="grid gap-1 min-w-0">
              <CardTitle className="truncate">
                {post.user.name || "匿名ユーザー"}
              </CardTitle>
              <CardDescription>
                {post.photo.takenAt
                  ? formatToYYYYMMDD(new Date(post.photo.takenAt))
                  : "-"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grow">
          <div className="relative aspect-square w-full">
            <Image
              src={post.photo.url}
              alt={post.description || "Post Image"}
              fill
              className="rounded-md object-cover"
            />
          </div>
          <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
            {post.description}
          </p>
        </CardContent>
        <CardFooter>
          <p className="text-xs flex items-center text-gray-500">
            <MapPin className="w-4 h-4 mr-1" /> {post.spot.name} (
            {post.spot.city.prefecture.name} {post.spot.city.name})
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
};
