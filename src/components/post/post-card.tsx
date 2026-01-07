import { MapPin, NotebookPen } from "lucide-react";
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
import type { PostList } from "@/features/post/service";
import { formatToYYYYMMDD } from "@/lib/format-date";

interface PostCardProps {
  post: PostList;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  if (post.type === "NOTE") {
    return (
      <Link href={`/post/${post.id}`} className="block h-full">
        <Card
          className="w-full cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col border-l-4 border-l-blue-400 bg-slate-50 dark:bg-slate-900"
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
                  {post.takenAt
                    ? formatToYYYYMMDD(new Date(post.takenAt))
                    : formatToYYYYMMDD(new Date(post.createdAt))}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grow pt-0">
            <div className="flex items-start gap-3">
              <NotebookPen className="w-5 h-5 text-slate-500 mt-1 shrink-0" />
              <div className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-6">
                {post.description}
              </div>
            </div>
          </CardContent>
          {post.spot && (
            <CardFooter>
              <p className="text-xs flex items-center text-gray-500">
                <MapPin className="w-4 h-4 mr-1" /> {post.spot.name} (
                {post.spot.city.prefecture.name} {post.spot.city.name})
              </p>
            </CardFooter>
          )}
        </Card>
      </Link>
    );
  }

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
                {post.takenAt
                  ? formatToYYYYMMDD(new Date(post.takenAt))
                  : formatToYYYYMMDD(new Date(post.createdAt))}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grow">
          <div className="relative aspect-square w-full">
            {post.photo && (
              <Image
                src={post.photo.url}
                alt={post.description || "Post Image"}
                fill
                className="rounded-md object-cover"
              />
            )}
          </div>
          <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
            {post.description}
          </p>
        </CardContent>
        {post.spot && (
          <CardFooter>
            <p className="text-xs flex items-center text-gray-500">
              <MapPin className="w-4 h-4 mr-1" /> {post.spot.name} (
              {post.spot.city.prefecture.name} {post.spot.city.name})
            </p>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
};
