"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatToYYYYMMDD } from "@/lib/format-date";
import { honoClient } from "@/lib/hono";

const formSchema = z.object({
  title: z.string().min(1, { message: "タイトルは必須です。" }),
  description: z.string().optional(),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
});

export default function NewTripPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startedAt: "",
      endedAt: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setApiError(null);

    try {
      const res = await honoClient.trip.$post({
        json: {
          title: values.title,
          description: values.description,
          startedAt: values.startedAt
            ? formatToYYYYMMDD(new Date(values.startedAt))
            : undefined,
          endedAt: values.endedAt
            ? formatToYYYYMMDD(new Date(values.endedAt))
            : undefined,
        },
      });

      if (!res.ok) {
        throw new Error("旅行の作成に失敗しました");
      }

      router.push("/admin/trips");
      router.refresh();
    } catch (e) {
      setApiError("旅行の作成に失敗しました。もう一度お試しください。");
      console.error(e);
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
                name="startedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>開始日</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date) =>
                          field.onChange(date ? formatToYYYYMMDD(date) : "")
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>終了日</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date) =>
                          field.onChange(date ? formatToYYYYMMDD(date) : "")
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {apiError && <p className="text-red-500 text-sm">{apiError}</p>}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={form.formState.isSubmitting}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "作成中..." : "作成する"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
