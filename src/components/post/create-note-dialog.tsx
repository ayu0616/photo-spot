"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { honoClient } from "@/lib/hono";

interface CreateNoteDialogProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
}

const formSchema = z.object({
  description: z.string().min(1, { message: "説明は必須です。" }),
  takenAt: z.date({ message: "日時は必須です。" }),
});

export function CreateNoteDialog({
  tripId,
  open,
  onOpenChange,
  defaultDate,
}: CreateNoteDialogProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      takenAt: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const res = await honoClient.post.$post({
        form: {
          type: "NOTE",
          description: values.description,
          tripId: tripId,
          takenAt: values.takenAt.toISOString(),
          spotName: "", // Optional for NOTE
          cityId: "", // Optional for NOTE
          spotId: "", // Optional for NOTE
        },
      });

      if (res.ok) {
        form.reset();
        onOpenChange(false);
        router.refresh(); // Refresh server components
        // Invalidate queries if using TanStack Query for posts list
        await queryClient.invalidateQueries({
          queryKey: ["posts"],
        });
        await queryClient.invalidateQueries({
          queryKey: [`trip-details-${tripId}`],
        });
      } else {
        console.error("Failed to create note");
      }
    } catch (error) {
      console.error("Error creating note:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>テキストを投稿</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="takenAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>日時</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      defaultMonth={defaultDate}
                    />
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
                  <FormLabel>本文</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="旅のメモや感想を書きましょう..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "投稿中..." : "投稿"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
