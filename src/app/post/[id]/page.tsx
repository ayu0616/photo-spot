import Image from "next/image";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PostWithRelationsDto } from "@/dto/post-dto";
import { formatToYYYYMMDD } from "@/lib/format-date";
import { honoClient } from "@/lib/hono";
import { PhotoExifDisplay } from "./_components/photo-exif-display";

const getPostDetail = async (
  id: string,
): Promise<PostWithRelationsDto | null> => {
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
  "use cache";
  const post = await getPostDetail((await params).id);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
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
                {formatToYYYYMMDD(new Date(post.createdAt))}
              </CardDescription>
            </div>
          </div>
          <h1 className="text-3xl font-bold">{post.description}</h1>
          <p className="text-sm text-gray-500">📍 {post.spot.name}</p>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-video mb-6">
            <Image
              src={post.photo.url}
              alt={post.description || "Post Image"}
              fill
              className="object-contain rounded-lg"
            />
          </div>

          {post.photo.latitude && post.photo.longitude && (
            <div className="mb-6 text-center">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${post.photo.latitude},${post.photo.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Google Mapsで表示 ({post.photo.latitude}, {post.photo.longitude}
                )
              </a>
            </div>
          )}

          {/* 撮影情報 (EXIF) */}
          <PhotoExifDisplay photo={post.photo} />
        </CardContent>
      </Card>
    </div>
  );
}
