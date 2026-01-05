"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatToYYYYMMDD } from "@/lib/format-date";
import { honoClient } from "@/lib/hono";

interface PostSummary {
  id: string;
  spot: { name: string };
  photo: {
    takenAt: string | null;
    url: string;
  };
}

interface Trip {
  id: string;
  title: string;
  description: string | null;
  startedAt: string | null;
  endedAt: string | null;
  posts: PostSummary[];
}

const tripKeys = {
  all: ["trips"] as const,
  detail: (id: string) => ["trips", id] as const,
};

const postKeys = {
  list: (from?: string, to?: string) => ["posts", "list", from, to] as const,
};

const formSchema = z.object({
  title: z.string().min(1, { message: "タイトルは必須です。" }),
  description: z.string().optional(),
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .optional(),
});

interface EditTripFormProps {
  trip: Trip;
  initialPosts: PostSummary[];
}

export default function EditTripForm({
  trip,
  initialPosts,
}: EditTripFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = trip.id;

  const [apiError, setApiError] = useState<string | null>(null);

  const [selectedPostIds, setSelectedPostIds] = useState<string[]>(
    trip.posts ? trip.posts.map((p) => p.id) : [],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: trip.title,
      description: trip.description || "",
      dateRange: {
        from: trip.startedAt ? new Date(trip.startedAt) : undefined,
        to: trip.endedAt ? new Date(trip.endedAt) : undefined,
      },
    },
  });

  const dateRange = form.watch("dateRange");

  const {
    data: postsData,
    isLoading: isPostsLoading,
    isError: isPostsError,
    error: postsQueryError,
  } = useQuery<PostSummary[], Error>({
    queryKey: postKeys.list(
      dateRange?.from ? formatToYYYYMMDD(dateRange.from) : undefined,
      dateRange?.to ? formatToYYYYMMDD(dateRange.to) : undefined,
    ),
    queryFn: async () => {
      const res = await honoClient.post["for-trip-edit"].$get({
        query: {
          from: dateRange?.from ? formatToYYYYMMDD(dateRange.from) : undefined,
          to: dateRange?.to ? formatToYYYYMMDD(dateRange.to) : undefined,
          tripId: id,
        },
      });
      if (!res.ok) {
        const errorData = (await res.json()) as { message?: string };
        throw new Error(errorData.message || "投稿の取得に失敗しました");
      }
      return res.json();
    },
    initialData: initialPosts,
  });

  useEffect(() => {
    if (isPostsError && postsQueryError) {
      setApiError(postsQueryError.message || "投稿の取得に失敗しました。");
    }
  }, [isPostsError, postsQueryError]);

  const updateTripMutation = useMutation<
    unknown,
    Error,
    z.infer<typeof formSchema>
  >({
    mutationFn: async (values) => {
      const res = await honoClient.trip[":id"].$put({
        param: { id },
        json: {
          title: values.title,
          description: values.description,
          startedAt: values.dateRange?.from
            ? formatToYYYYMMDD(values.dateRange.from)
            : undefined,
          endedAt: values.dateRange?.to
            ? formatToYYYYMMDD(values.dateRange.to)
            : undefined,
          postIds: selectedPostIds,
        },
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { message?: string };
        throw new Error(errorData.message || "旅行の更新に失敗しました");
      }
      return res.json() as Promise<unknown>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      router.push(`/trip/${id}`);
      router.refresh();
    },
    onError: (error: Error) => {
      setApiError(
        error.message || "旅行の更新に失敗しました。もう一度お試しください。",
      );
    },
  });

  const deleteTripMutation = useMutation<unknown, Error>({
    mutationFn: async () => {
      const res = await honoClient.trip[":id"].$delete({ param: { id } });
      if (!res.ok) {
        const errorData = (await res.json()) as { message?: string };
        throw new Error(errorData.message || "旅行の削除に失敗しました");
      }
      return res.json() as Promise<unknown>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      router.push("/");
      router.refresh();
    },
    onError: (error: Error) => {
      setApiError(
        error.message || "旅行の削除に失敗しました。もう一度お試しください。",
      );
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setApiError(null);
    updateTripMutation.mutate(values);
  }

  async function onDelete() {
    if (!confirm("本当にこの旅行を削除しますか？")) return;
    setApiError(null);
    deleteTripMutation.mutate();
  }

  const togglePostSelection = (postId: string) => {
    setSelectedPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId],
    );
  };

  const isSubmitting =
    updateTripMutation.isPending || deleteTripMutation.isPending;

  const displayPosts = postsData || [];

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>旅行の編集</CardTitle>
          <CardDescription>旅行の詳細を更新します。</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>タイトル</FormLabel>
                    <FormControl>
                      <Input placeholder="旅行のタイトル" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>説明</FormLabel>
                    <FormControl>
                      <Textarea placeholder="旅行の説明" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>日程</FormLabel>
                    <FormControl>
                      <DateRangePicker
                        value={{
                          from: field.value?.from,
                          to: field.value?.to,
                        }}
                        onChange={(dateRange) =>
                          field.onChange({
                            from: dateRange?.from,
                            to: dateRange?.to,
                          })
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>投稿の選択</Label>
                <div className="grid grid-cols-2 gap-4 border p-4 rounded-md max-h-96 overflow-y-auto bg-gray-50/50">
                  {isPostsLoading ? (
                    <div className="col-span-2 text-center text-gray-500 py-4">
                      読み込み中...
                    </div>
                  ) : displayPosts.length === 0 ? (
                    <div className="col-span-2 text-center text-gray-500 py-4">
                      該当する期間の投稿がありません
                    </div>
                  ) : (
                    displayPosts.map((post) => (
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
                              {post.photo.takenAt
                                ? formatToYYYYMMDD(new Date(post.photo.takenAt))
                                : "-"}
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

              {apiError && <p className="text-red-500 text-sm">{apiError}</p>}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={isSubmitting}
                >
                  削除する
                </Button>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    キャンセル
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "更新中..." : "更新する"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
