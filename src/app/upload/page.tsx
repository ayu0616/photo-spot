"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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

export default function UploadPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

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
    setError(null);

    switch (values.spotMode) {
      case "new": {
        values.selectedSpotId = "";
        break;
      }
      case "existing": {
        values.newSpotCityId = "";
        values.newSpotName = "";
        break;
      }
    }

    try {
      const response = await honoClient.post.$post({
        form: {
          image: values.image,
          description: values.description,
          spotName: values.newSpotName,
          cityId: values.newSpotCityId,
          spotId: values.selectedSpotId,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "投稿の作成に失敗しました。");
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">新規投稿作成</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          {previewUrl && (
            <div className="mt-4">
              <Image
                src={previewUrl}
                alt="アップロード画像"
                width={500}
                height={300}
                className="max-w-full h-auto rounded-md"
              />
            </div>
          )}

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
                      <RadioGroupItem value="new" className="cursor-pointer" />
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
              <FormField
                control={form.control}
                name="selectedPrefectureId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>都道府県</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="都道府県を選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {prefectures.map((pref) => (
                          <SelectItem key={pref.id} value={pref.id.toString()}>
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
                          <SelectItem key={city.id} value={city.id.toString()}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isFetchingCities && (
                      <FormDescription>市町村情報を取得中...</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
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

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "アップロード中..." : "投稿を作成"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
