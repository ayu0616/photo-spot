// src/app/post/[id]/page.tsx

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
import { PhotoExifDisplay } from "./_components/photo-exif-display";

const getPostDetail = async (
  id: string,
): Promise<PostWithRelationsDto | null> => {
  // NEXT_PUBLIC_API_BASE_URL が設定されていない場合、開発環境では localhost:3000 を使用する
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${apiBaseUrl}/api/post/${id}`, {
    cache: "no-store", // SSRのためにキャッシュしない
  });

  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Failed to fetch post detail");
  }

  return res.json();
};

export default async function PostDetailPage({
  params,
}: PageProps<"/post/[id]">) {
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

          {/* 撮影情報 (EXIF) */}
          <PhotoExifDisplay photo={post.photo} />
        </CardContent>
      </Card>
    </div>
  );
}
