"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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

export default function NewTripPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    try {
      const res = await honoClient.trip.$post({
        json: {
          title,
          description,
        },
      });

      if (!res.ok) {
        throw new Error("旅行の作成に失敗しました");
      }

      router.push("/admin/trips");
      router.refresh();
    } catch (e) {
      setError("旅行の作成に失敗しました。もう一度お試しください。");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>旅行の新規作成</CardTitle>
          <CardDescription>
            新しい旅行を作成して投稿をグループ化します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">タイトル</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="旅行のタイトル"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="旅行の説明"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "作成中..." : "作成する"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
