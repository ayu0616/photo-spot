// src/app/upload/page.tsx

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { honoClient } from "@/lib/hono";

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

export default function UploadPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [spotMode, setSpotMode] = useState<"new" | "existing">("new");
  const [existingSpots, setExistingSpots] = useState<Spot[]>([]);
  const [selectedSpotId, setSelectedSpotId] = useState<string>("");

  // For new spot creation
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [selectedPrefectureId, setSelectedPrefectureId] = useState<
    number | null
  >(null);
  const [cities, setCities] = useState<City[]>([]);
  const [newSpotCityId, setNewSpotCityId] = useState<number | null>(null);
  const [newSpotName, setNewSpotName] = useState<string>("");

  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

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
            setSelectedSpotId(spotsData[0].id);
          }
        } catch (err: any) {
          console.error("Error fetching spots:", err);
          setError("既存のスポットの読み込みに失敗しました。");
        }
      };
      fetchSpots();
    }
  }, [spotMode]);

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
          setSelectedPrefectureId(prefecturesData[0].id);
        }
      } catch (err: any) {
        console.error("Error fetching prefectures:", err);
        setError("都道府県の読み込みに失敗しました。");
      }
    };
    fetchPrefectures();
  }, []);

  // Fetch cities based on selected prefecture
  useEffect(() => {
    if (selectedPrefectureId !== null) {
      const fetchCities = async () => {
        try {
          const response = await honoClient.master.cities[":prefectureId"].$get(
            {
              param: { prefectureId: selectedPrefectureId.toString() },
            },
          );
          if (!response.ok) {
            throw new Error("Failed to fetch cities.");
          }
          const citiesData: City[] = await response.json();
          setCities(citiesData);
          if (citiesData.length > 0) {
            setNewSpotCityId(citiesData[0].id);
          } else {
            setNewSpotCityId(null);
          }
        } catch (err: any) {
          console.error("Error fetching cities:", err);
          setError("選択された都道府県の市町村の読み込みに失敗しました。");
        }
      };
      fetchCities();
    } else {
      setCities([]);
      setNewSpotCityId(null);
    }
  }, [selectedPrefectureId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!imageFile || !description) {
      setError("画像と説明は必須です。");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("description", description);

    if (spotMode === "new") {
      if (!newSpotName || newSpotCityId === null) {
        setError("新しいスポット名と市町村は必須です。");
        setLoading(false);
        return;
      }
      formData.append("spotName", newSpotName);
      formData.append("cityId", newSpotCityId.toString());
    } else {
      if (!selectedSpotId) {
        setError("既存のスポットを選択してください。");
        setLoading(false);
        return;
      }
      formData.append("spotId", selectedSpotId);
    }

    try {
      const response = await honoClient.post.$post({
        form: formData,
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="image">画像</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {previewUrl && (
            <div className="mt-4">
              <Image
                src={previewUrl}
                alt="アップロード画像"
                width={500} // Specify appropriate width
                height={300} // Specify appropriate height
                className="max-w-full h-auto rounded-md"
              />
            </div>
          )}
        </div>

        {/* Spot Selection Mode */}
        <RadioGroup
          defaultValue="new"
          value={spotMode}
          onValueChange={(value: "new" | "existing") => setSpotMode(value)}
          className="flex items-center space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="new" id="newSpot" />
            <Label htmlFor="newSpot">新しいスポットを作成</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="existing" id="existingSpotRadio" />
            <Label htmlFor="existingSpotRadio">既存のスポットを選択</Label>
          </div>
        </RadioGroup>

        {spotMode === "new" ? (
          <>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="newSpotName">新しいスポット名</Label>
              <Input
                id="newSpotName"
                type="text"
                value={newSpotName}
                onChange={(e) => setNewSpotName(e.target.value)}
                required
              />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="prefecture">都道府県</Label>
              <Select
                value={selectedPrefectureId?.toString() || ""}
                onValueChange={(value) =>
                  setSelectedPrefectureId(Number(value))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="都道府県を選択" />
                </SelectTrigger>
                <SelectContent>
                  {prefectures.map((pref) => (
                    <SelectItem key={pref.id} value={pref.id.toString()}>
                      {pref.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="newSpotCityId">市町村</Label>
              <Select
                value={newSpotCityId?.toString() || ""}
                onValueChange={(value) => setNewSpotCityId(Number(value))}
                disabled={cities.length === 0}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="市町村を選択" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="existingSpot">既存のスポットを選択</Label>
            <Select
              value={selectedSpotId}
              onValueChange={(value) => setSelectedSpotId(value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="既存のスポットを選択" />
              </SelectTrigger>
              <SelectContent>
                {existingSpots.map((spot) => (
                  <SelectItem key={spot.id} value={spot.id}>
                    {spot.name} (City ID: {spot.cityId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="description">説明</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "アップロード中..." : "投稿を作成"}
        </Button>
      </form>
    </div>
  );
}
