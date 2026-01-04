import { MapPin, PlaneIcon } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextAuth]/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PostWithRelationsDto } from "@/features/post/PostDto";
import { formatToYYYYMMDD } from "@/lib/format-date";
import { honoClient } from "@/lib/hono";
import { BasicExifInfo } from "./_components/basic-exif-info";
import { DetailedExifInfo } from "./_components/detailed-exif-info";
import { LocationInfo } from "./_components/location-info";
import { PostActionsMenu } from "./_components/post-actions-menu";
import { PostImage } from "./_components/post-image";

export const getPostCacheTag = (id: string) => `post-detail-${id}`;

const getPostDetail = async (
  id: string,
): Promise<PostWithRelationsDto | null> => {
  "use cache";
  cacheTag(getPostCacheTag(id));
  cacheLife("minutes");

  const res = await honoClient.post[":id"].$get({
    param: {
      id,
    },
  });

  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Failed to fetch post detail");
  }

  const postWithRelation = await res.json();
  return {
    ...postWithRelation,
    photo: {
      ...postWithRelation.photo,
      takenAt: postWithRelation.photo.takenAt
        ? new Date(postWithRelation.photo.takenAt)
        : null,
    },
    createdAt: new Date(postWithRelation.createdAt),
    updatedAt: new Date(postWithRelation.updatedAt),
  };
};

export default async function PostDetailPage({
  params,
}: PageProps<"/post/[id]">) {
  const post = await getPostDetail((await params).id);
  const session = await auth();

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={post.user.image || undefined}
                  alt={post.user.name || "User Avatar"}
                />
                <AvatarFallback>
                  {post.user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{post.user.name || "匿名ユーザー"}</CardTitle>
                <CardDescription>
                  {post.photo.takenAt
                    ? formatToYYYYMMDD(new Date(post.photo.takenAt))
                    : "-"}
                </CardDescription>
              </div>
            </div>
            <PostActionsMenu
              post={post}
              currentUserId={session?.user?.id || undefined}
            />
          </div>

          <p className="text-sm flex items-center text-gray-500">
            <MapPin className="w-4 h-4 mr-1" /> {post.spot.name} (
            {post.spot.city.prefecture.name} {post.spot.city.name})
          </p>
          {post.trip && (
            <div className="mt-2">
              <Link
                href={{
                  pathname: `/trip/${post.trip.id}`,
                  hash: `#${post.id}`,
                }}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <PlaneIcon className="w-4 h-4" />
                <span>{post.trip.title}</span>
              </Link>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="w-full mb-6">
            <PostImage
              src={post.photo.url}
              alt={post.description || "Post Image"}
            />
          </div>

          {/* 基本的な撮影情報 */}
          <BasicExifInfo photo={post.photo} />

          {/* 位置情報 */}
          <div className="mt-6">
            <LocationInfo
              latitude={post.photo.latitude}
              longitude={post.photo.longitude}
            />
          </div>

          <p className="text-base mb-6 mt-6 whitespace-pre-wrap">
            {post.description}
          </p>

          {/* 詳細な撮影情報 */}
          <DetailedExifInfo photo={post.photo} />
        </CardContent>
      </Card>
    </div>
  );
}
