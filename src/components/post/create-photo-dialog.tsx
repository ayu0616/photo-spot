"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ClipboardIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
  FormDescription,
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
import { useCities } from "@/hooks/use-cities";
import { usePrefectures } from "@/hooks/use-prefectures";
import { useSpots } from "@/hooks/use-spots";
import { honoClient } from "@/lib/hono";

interface CreatePhotoDialogProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z
  .object({
    image: z.custom<File>((val) => val instanceof File, "画像は必須です。"),
    description: z.string().min(0, { message: "説明は必須です。" }),
    spotMode: z.enum(["new", "existing"]),
    selectedSpotId: z.string().optional(),
    newSpotName: z.string().optional(),
    selectedPrefectureId: z.string().optional(),
    newSpotCityId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.spotMode === "new") {
      if (!data.newSpotName) {
        ctx.addIssue({
          code: "custom",
          path: ["newSpotName"],
          message: "新しいスポット名は必須です。",
        });
      }
      if (!data.selectedPrefectureId) {
        ctx.addIssue({
          code: "custom",
          path: ["selectedPrefectureId"],
          message: "都道府県は必須です。",
        });
      }
      if (!data.newSpotCityId) {
        ctx.addIssue({
          code: "custom",
          path: ["newSpotCityId"],
          message: "市町村は必須です。",
        });
      }
    }
    if (data.spotMode === "existing") {
      if (!data.selectedSpotId) {
        ctx.addIssue({
          code: "custom",
          path: ["selectedSpotId"],
          message: "既存のスポットを選択してください。",
        });
      }
    }
  });

export function CreatePhotoDialog({
  tripId,
  open,
  onOpenChange,
}: CreatePhotoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      spotMode: "new",
      selectedPrefectureId: "",
      newSpotCityId: "",
      newSpotName: "",
      selectedSpotId: "",
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        description: "",
        spotMode: "new",
        selectedPrefectureId: "",
        newSpotCityId: "",
        newSpotName: "",
        selectedSpotId: "",
      });
      setPreviewUrl(null);
    }
  }, [open, form]);

  const spotMode = form.watch("spotMode");
  const selectedPrefectureId = form.watch("selectedPrefectureId");

  // Fetch data using TanStack Query
  const { data: existingSpots = [] } = useSpots(spotMode === "existing");
  const { data: prefectures = [] } = usePrefectures();
  const { data: cities = [], isFetching: isFetchingCities } =
    useCities(selectedPrefectureId);

  // Reset city selection when prefecture changes
  useEffect(() => {
    if (selectedPrefectureId) {
      form.setValue("newSpotCityId", "");
    } else {
      form.setValue("newSpotCityId", undefined);
    }
  }, [selectedPrefectureId, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    const commonData = {
      description: values.description,
      spotName: "",
      cityId: "",
      spotId: "",
    };

    if (values.spotMode === "new") {
      commonData.spotName = values.newSpotName || "";
      commonData.cityId = values.newSpotCityId || "";
    } else if (values.spotMode === "existing") {
      commonData.spotId = values.selectedSpotId || "";
    }

    try {
      const res = await honoClient.post.$post({
        form: {
          type: "PHOTO",
          image: values.image,
          tripId: tripId,
          ...commonData,
        },
      });

      if (res.ok) {
        onOpenChange(false);
        router.refresh();
        await queryClient.invalidateQueries({
          queryKey: ["posts"],
        });
        await queryClient.invalidateQueries({
          queryKey: [`trip-details-${tripId}`],
        });
      } else {
        console.error("Failed to create photo post");
      }
    } catch (error) {
      console.error("Error creating photo post:", error);
    } finally {
      setLoading(false);
    }
  };

  const pasteImage = useCallback(async () => {
    const clipboardItems = await navigator.clipboard.read();
    for (const item of clipboardItems) {
      for (const type of item.types) {
        if (type.startsWith("image/")) {
          const blob = await item.getType(type);
          const ext = type.split("/")[1];
          const rnd = crypto.randomUUID();
          const file = new File([blob], `${rnd}.${ext}`, { type });
          form.setValue("image", file);
          setPreviewUrl(URL.createObjectURL(file));
          return;
        }
      }
    }
  }, [form.setValue]);

  useEffect(() => {
    if (!open) return;
    const _handlePaste = (_e: ClipboardEvent) => {
      // Only handle paste if the dialog is open and focused (or contained)
      // For simplicity, we just add the listener when mounted, but we should be careful.
      // The useCallback above uses navigator.clipboard.read() which is triggered by button.
      // This useEffect is for ctrl+v global listener if desired, but sticking to button might be safer for dialogs.
      // Let's stick to the button for now to avoid conflict with other inputs.
    };
    // document.addEventListener("paste", pasteImage);
    // return () => {
    //   document.removeEventListener("paste", pasteImage);
    // };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>写真を投稿</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>画像</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file);
                            setPreviewUrl(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                onClick={pasteImage}
                className="w-full"
              >
                <ClipboardIcon className="mr-2 h-4 w-4" />
                クリップボードから画像を貼り付け
              </Button>
              {previewUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-background">
                  <Image
                    src={previewUrl}
                    alt="アップロード画像"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="spotMode"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>スポット情報</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0"
                      >
                        <Label className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-accent transition-colors [&:has(:checked)]:bg-accent [&:has(:checked)]:border-primary">
                          <RadioGroupItem value="new" />
                          <span>新しいスポット</span>
                        </Label>
                        <Label className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-accent transition-colors [&:has(:checked)]:bg-accent [&:has(:checked)]:border-primary">
                          <RadioGroupItem value="existing" />
                          <span>既存のスポット</span>
                        </Label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-4 border rounded-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="selectedPrefectureId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>都道府県</FormLabel>
                        <Select
                          onValueChange={field.onChange}
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
                        {isFetchingCities && (
                          <FormDescription>
                            市町村情報を取得中...
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {spotMode === "new" ? (
                  <FormField
                    control={form.control}
                    name="newSpotName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>新しいスポット名</FormLabel>
                        <FormControl>
                          <Input placeholder="例: 東京タワー" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="selectedSpotId"
                    render={({ field }) => {
                      const selectedCityId = form.watch("newSpotCityId");
                      const filteredSpots = existingSpots.filter((spot) => {
                        const prefMatch = selectedPrefectureId
                          ? spot.prefectureId === Number(selectedPrefectureId)
                          : true;
                        const cityMatch = selectedCityId
                          ? spot.cityId === Number(selectedCityId)
                          : true;
                        return prefMatch && cityMatch;
                      });

                      return (
                        <FormItem>
                          <FormLabel>既存のスポットを選択</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="既存のスポットを選択" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredSpots.length === 0 ? (
                                <div className="p-2 text-sm text-gray-500 text-center">
                                  該当するスポットがありません
                                </div>
                              ) : (
                                filteredSpots.map((spot) => (
                                  <SelectItem key={spot.id} value={spot.id}>
                                    {spot.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>本文</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="旅の思い出や出来事を書きましょう..."
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
