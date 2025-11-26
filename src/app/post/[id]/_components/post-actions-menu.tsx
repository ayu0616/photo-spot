"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, MoreVertical, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PostWithRelationsDto } from "@/features/post/PostDto";
import { useCities } from "@/hooks/use-cities";
import { usePrefectures } from "@/hooks/use-prefectures";
import { useSpots } from "@/hooks/use-spots";
import { honoClient } from "@/lib/hono";

interface PostActionsMenuProps {
  post: PostWithRelationsDto;
  currentUserId?: string;
}

const formSchema = z.union([
  z.object({
    description: z.string().min(0, { message: "説明は必須です。" }),
    spotMode: z.enum(["new"]),
    selectedSpotId: z.string().optional(),
    newSpotName: z.string().min(1, { message: "スポット名は必須です。" }),
    selectedPrefectureId: z
      .string()
      .min(1, { message: "都道府県は必須です。" }),
    newSpotCityId: z.string().min(1, { message: "市町村は必須です。" }),
  }),
  z.object({
    description: z.string().min(0, { message: "説明は必須です。" }),
    spotMode: z.enum(["existing"]),
    selectedSpotId: z
      .string()
      .min(1, { message: "スポットを選択してください。" }),
    newSpotName: z.string().optional(),
    selectedPrefectureId: z.string().optional(),
    newSpotCityId: z.string().optional(),
  }),
]);

export function PostActionsMenu({ post, currentUserId }: PostActionsMenuProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if current user is the author
  if (!currentUserId || currentUserId !== post.user.id) {
    return null;
  }

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await honoClient.post[":id"].$delete({
        param: { id: post.id },
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        console.error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4" />
            <span>編集</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 text-red-600 focus:text-red-600"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash className="h-4 w-4" />
            <span>削除</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。投稿を削除すると、関連するデータも完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "削除中..." : "削除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditPostDialog
        post={post}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}

function EditPostDialog({
  post,
  open,
  onOpenChange,
}: {
  post: PostWithRelationsDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: post.description || "",
      spotMode: "existing",
      selectedSpotId: post.spot.id,
      selectedPrefectureId: post.spot.city.prefecture.id.toString(),
      newSpotCityId: post.spot.city.id.toString(),
      newSpotName: post.spot.name,
    },
  });

  // Reset form when dialog opens/closes or post changes
  useEffect(() => {
    if (open) {
      form.reset({
        description: post.description || "",
        spotMode: "existing",
        selectedSpotId: post.spot.id,
        selectedPrefectureId: post.spot.city.prefecture.id.toString(),
        newSpotCityId: post.spot.city.id.toString(),
        newSpotName: post.spot.name,
      });
    }
  }, [open, post, form]);

  const spotMode = form.watch("spotMode");
  const selectedPrefectureId = form.watch("selectedPrefectureId");

  const { data: existingSpots = [] } = useSpots(spotMode === "existing");
  const { data: prefectures = [] } = usePrefectures();
  const { data: cities = [], isFetching: isFetchingCities } =
    useCities(selectedPrefectureId);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const spotData = {
        spotId: "",
        spotName: "",
        cityId: "",
      };
      if (values.spotMode === "new") {
        spotData.spotName = values.newSpotName;
        spotData.cityId = values.newSpotCityId;
      } else {
        spotData.spotId = values.selectedSpotId;
      }

      const res = await honoClient.post[":id"].$put({
        param: { id: post.id },
        form: {
          description: values.description,
          ...spotData,
        },
      });

      if (res.ok) {
        onOpenChange(false);
        router.refresh();
      } else {
        console.error("Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>投稿を編集</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="spotMode"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>スポット選択</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-4"
                    >
                      <Label className="font-normal cursor-pointer">
                        <RadioGroupItem
                          value="new"
                          className="cursor-pointer"
                        />
                        新しいスポットを作成
                      </Label>
                      <Label className="font-normal cursor-pointer">
                        <RadioGroupItem
                          value="existing"
                          className="cursor-pointer"
                        />
                        既存のスポットを選択
                      </Label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {spotMode === "new" ? (
              <>
                <FormField
                  control={form.control}
                  name="newSpotName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>新しいスポット名</FormLabel>
                      <FormControl>
                        <Input placeholder="新しいスポット名" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="selectedPrefectureId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>都道府県</FormLabel>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            form.setValue("newSpotCityId", ""); // Reset city on pref change
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="都道府県を選択" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {prefectures.map((pref) => (
                              <SelectItem
                                key={pref.id}
                                value={pref.id.toString()}
                              >
                                {pref.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newSpotCityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>市町村</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={
                            !selectedPrefectureId ||
                            cities.length === 0 ||
                            isFetchingCities
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="市町村を選択" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem
                                key={city.id}
                                value={city.id.toString()}
                              >
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            ) : (
              <FormField
                control={form.control}
                name="selectedSpotId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>既存のスポットを選択</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="既存のスポットを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {existingSpots.map((spot) => (
                          <SelectItem key={spot.id} value={spot.id}>
                            {spot.name} (City ID: {spot.cityId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>説明</FormLabel>
                  <FormControl>
                    <Textarea placeholder="説明" {...field} />
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
                {loading ? "更新中..." : "更新"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
