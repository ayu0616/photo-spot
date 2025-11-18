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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { honoClient } from "@/lib/hono";
import { Label } from "@/components/ui/label";

interface Spot {
  id: string;
  name: string;
  cityId: number;
}

interface Prefecture {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
  prefectureId: number;
}

const formSchema = z
  .object({
    image: z.custom<File>((val) => val instanceof File, "画像は必須です。"),
    description: z.string().min(1, { message: "説明は必須です。" }),
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
  const [existingSpots, setExistingSpots] = useState<Spot[]>([]);
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      spotMode: "new",
    },
  });

  const spotMode = form.watch("spotMode");
  const selectedPrefectureId = form.watch("selectedPrefectureId");

  // Fetch existing spots
  useEffect(() => {
    if (spotMode === "existing") {
      const fetchSpots = async () => {
        try {
          const response = await honoClient.spot.$get();
          if (!response.ok) {
            throw new Error("Failed to fetch spots.");
          }
          const spotsData: Spot[] = await response.json();
          setExistingSpots(spotsData);
          if (spotsData.length > 0) {
            form.setValue("selectedSpotId", spotsData[0].id);
          }
        } catch (err: any) {
          console.error("Error fetching spots:", err);
          setError("既存のスポットの読み込みに失敗しました。");
        }
      };
      fetchSpots();
    }
  }, [spotMode, form]);

  // Fetch prefectures
  useEffect(() => {
    const fetchPrefectures = async () => {
      try {
        const response = await honoClient.master.prefectures.$get();
        if (!response.ok) {
          throw new Error("Failed to fetch prefectures.");
        }
        const prefecturesData: Prefecture[] = await response.json();
        setPrefectures(prefecturesData);
        if (prefecturesData.length > 0) {
          form.setValue(
            "selectedPrefectureId",
            prefecturesData[0].id.toString(),
          );
        }
      } catch (err: any) {
        console.error("Error fetching prefectures:", err);
        setError("都道府県の読み込みに失敗しました。");
      }
    };
    fetchPrefectures();
  }, [form]);

  // Fetch cities based on selected prefecture
  useEffect(() => {
    if (selectedPrefectureId) {
      const fetchCities = async () => {
        try {
          const response = await honoClient.master.cities[":prefectureId"].$get(
            {
              param: { prefectureId: selectedPrefectureId },
            },
          );
          if (!response.ok) {
            throw new Error("Failed to fetch cities.");
          }
          const citiesData: City[] = await response.json();
          setCities(citiesData);
          if (citiesData.length > 0) {
            form.setValue("newSpotCityId", citiesData[0].id.toString());
          } else {
            form.setValue("newSpotCityId", undefined);
          }
        } catch (err: any) {
          console.error("Error fetching cities:", err);
          setError("選択された都道府県の市町村の読み込みに失敗しました。");
        }
      };
      fetchCities();
    } else {
      setCities([]);
      form.setValue("newSpotCityId", undefined);
    }
  }, [selectedPrefectureId, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError(null);

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
    } catch (err: any) {
      setError(err.message);
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
                      disabled={cities.length === 0}
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
