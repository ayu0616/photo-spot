"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { honoClient } from "@/lib/hono";

interface PostSummary {
  id: string;
  spot: { name: string };
  createdAt: string;
  photo: { url: string };
}

export default function EditTripPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaultValues, setDefaultValues] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [allPosts, setAllPosts] = useState<PostSummary[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tripRes, postsRes] = await Promise.all([
          honoClient.trip[":id"].$get({ param: { id } }),
          honoClient.post.all.$get(),
        ]);

        if (!tripRes.ok) throw new Error("旅行の取得に失敗しました");
        if (!postsRes.ok) throw new Error("投稿の取得に失敗しました");

        const trip = await tripRes.json();
        const posts = await postsRes.json();

        setDefaultValues({
          title: trip.title,
          description: trip.description || "",
        });
        setAllPosts(posts);

        if (trip.posts) {
          setSelectedPostIds(trip.posts.map((p: any) => p.id));
        }
      } catch (e) {
        setError("データの読み込みに失敗しました。");
        console.error(e);
      } finally {
        setIsFetching(false);
      }
    }
    fetchData();
  }, [id]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    try {
      const res = await honoClient.trip[":id"].$put({
        param: { id },
        json: {
          title,
          description,
          postIds: selectedPostIds,
        },
      });

      if (!res.ok) {
        throw new Error("旅行の更新に失敗しました");
      }

      router.push("/admin/trips");
      router.refresh();
    } catch (e) {
      setError("旅行の更新に失敗しました。もう一度お試しください。");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function onDelete() {
    if (!confirm("本当にこの旅行を削除しますか？")) return;

    setIsLoading(true);
    try {
      const res = await honoClient.trip[":id"].$delete({
        param: { id },
      });

      if (!res.ok) {
        throw new Error("旅行の削除に失敗しました");
      }

      router.push("/admin/trips");
      router.refresh();
    } catch (e) {
      setError("旅行の削除に失敗しました。もう一度お試しください。");
      console.error(e);
      setIsLoading(false);
    }
  }

  const togglePostSelection = (postId: string) => {
    setSelectedPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId],
    );
  };

  if (isFetching)
    return <div className="container mx-auto py-10">読み込み中...</div>;
  if (!defaultValues)
    return <div className="container mx-auto py-10">旅行が見つかりません</div>;

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>旅行の編集</CardTitle>
          <CardDescription>旅行の詳細を更新します。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">タイトル</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={defaultValues.title}
                placeholder="旅行のタイトル"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={defaultValues.description}
                placeholder="旅行の説明"
              />
            </div>

            <div className="space-y-2">
              <Label>投稿の選択</Label>
              <div className="grid grid-cols-2 gap-4 border p-4 rounded-md max-h-96 overflow-y-auto bg-gray-50/50">
                {allPosts.length === 0 ? (
                  <div className="col-span-2 text-center text-gray-500 py-4">
                    投稿がありません
                  </div>
                ) : (
                  allPosts.map((post) => (
                    <button
                      key={post.id}
                      type="button"
                      className={`group relative flex flex-col items-start space-y-2 p-3 rounded-lg border transition-all hover:shadow-sm ${
                        selectedPostIds.includes(post.id)
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-card hover:bg-accent hover:text-accent-foreground"
                      }`}
                      onClick={() => togglePostSelection(post.id)}
                    >
                      <div className="flex w-full justify-between items-start">
                        <div className="space-y-1 text-left">
                          <p className="font-medium leading-none truncate w-32">
                            {post.spot.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div
                          className={`h-4 w-4 rounded-sm border border-primary flex items-center justify-center ${
                            selectedPostIds.includes(post.id)
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50"
                          }`}
                        >
                          {selectedPostIds.includes(post.id) && (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </div>
                      </div>
                      {post.photo?.url && (
                        <div className="relative w-full aspect-video mt-2 rounded-md overflow-hidden bg-muted">
                          <Image
                            src={post.photo.url}
                            alt="Post"
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground text-right">
                選択中: {selectedPostIds.length} 件
              </p>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-between pt-4 border-t">
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={isLoading}
              >
                削除する
              </Button>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "更新中..." : "更新する"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
