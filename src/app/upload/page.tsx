"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, ClipboardIcon, NotebookPen } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
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
import { cn } from "@/lib/utils";

const formSchema = z
  .object({
    type: z.enum(["PHOTO", "NOTE"]),
    image: z.custom<File>().optional(),
    description: z.string().min(0, { message: "説明は必須です。" }),
    takenAt: z.date({ message: "日時は必須です。" }),
    spotMode: z.enum(["new", "existing", "none"]),
    selectedSpotId: z.string().optional(),
    newSpotName: z.string().optional(),
    selectedPrefectureId: z.string().optional(),
    newSpotCityId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "PHOTO") {
      if (!data.image || !(data.image instanceof File)) {
        ctx.addIssue({
          code: "custom",
          path: ["image"],
          message: "画像は必須です。",
        });
      }
      if (data.spotMode === "none") {
        ctx.addIssue({
          code: "custom",
          path: ["spotMode"],
          message: "写真投稿にはスポット情報が必須です。",
        });
      }
    }

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

export default function UploadPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "PHOTO",
      description: "",
      takenAt: undefined,
      spotMode: "new",
      selectedPrefectureId: "",
      newSpotCityId: "",
      newSpotName: "",
      selectedSpotId: "",
    },
  });

  const spotMode = form.watch("spotMode");
  const selectedPrefectureId = form.watch("selectedPrefectureId");
  const postType = form.watch("type");

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

  // When switching to PHOTO, if spotMode is none, switch to new
  useEffect(() => {
    if (postType === "PHOTO" && spotMode === "none") {
      form.setValue("spotMode", "new");
    }
  }, [postType, spotMode, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError(null);

    const commonData = {
      description: values.description,
      takenAt: values.takenAt.toISOString(),
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
      const response =
        values.type === "PHOTO" && values.image
          ? await honoClient.post.$post({
              form: {
                type: "PHOTO",
                image: values.image,
                ...commonData,
              },
            })
          : await honoClient.post.$post({
              form: {
                type: "NOTE",
                ...commonData,
              },
            });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          typeof errorData.error === "string"
            ? errorData.error
            : JSON.stringify(errorData.error);
        throw new Error(errorMessage || "投稿の作成に失敗しました。");
      }

      const result = await response.json();
      console.log("Post created successfully:", result);
      router.push("/"); // Redirect to home or post details page
    } catch (err) {
      if (
        err instanceof Object &&
        "message" in err &&
        typeof err.message === "string"
      ) {
        setError(err.message);
      }
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
    document.addEventListener("paste", pasteImage);
    return () => {
      document.removeEventListener("paste", pasteImage);
    };
  }, [pasteImage]);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">新規投稿作成</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>投稿タイプ</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex w-full rounded-lg border p-1"
                  >
                    <Label
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all cursor-pointer",
                        field.value === "PHOTO"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted/50",
                      )}
                    >
                      <RadioGroupItem value="PHOTO" className="sr-only" />
                      <Camera className="w-4 h-4" />
                      写真
                    </Label>
                    <Label
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all cursor-pointer",
                        field.value === "NOTE"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted/50",
                      )}
                    >
                      <RadioGroupItem value="NOTE" className="sr-only" />
                      <NotebookPen className="w-4 h-4" />
                      テキスト
                    </Label>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {postType === "PHOTO" && (
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
          )}

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
                      value={field.value}
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
                      {postType === "NOTE" && (
                        <Label className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-accent transition-colors [&:has(:checked)]:bg-accent [&:has(:checked)]:border-primary">
                          <RadioGroupItem value="none" />
                          <span>場所なし</span>
                        </Label>
                      )}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {spotMode !== "none" && (
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
            )}
          </div>

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
                    placeholder="旅の思い出や出来事を書きましょう..."
                    className="min-h-[150px] leading-relaxed"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "アップロード中..." : "投稿を作成"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
