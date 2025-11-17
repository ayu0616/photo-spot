// src/app/upload/page.tsx

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Spot {
  id: string;
  name: string;
  cityId: number;
}

export default function UploadPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [spotMode, setSpotMode] = useState<"new" | "existing">("new");
  const [existingSpots, setExistingSpots] = useState<Spot[]>([]);
  const [selectedSpotId, setSelectedSpotId] = useState<string>("");
  const [newSpotName, setNewSpotName] = useState<string>("");
  const [newSpotCityId, setNewSpotCityId] = useState<number>(1); // Default to a city ID, will be dynamic later
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (spotMode === "existing") {
      const fetchSpots = async () => {
        try {
          const response = await fetch("/api/spot");
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
          setError("Failed to load existing spots.");
        }
      };
      fetchSpots();
    }
  }, [spotMode]);

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
      setError("Image and description are required.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("description", description);
    formData.append("userId", "some-user-id"); // TODO: Replace with actual user ID from session

    if (spotMode === "new") {
      if (!newSpotName || !newSpotCityId) {
        setError("New spot name and city ID are required.");
        setLoading(false);
        return;
      }
      formData.append("spotName", newSpotName);
      formData.append("cityId", newSpotCityId.toString());
    } else {
      if (!selectedSpotId) {
        setError("Please select an existing spot.");
        setLoading(false);
        return;
      }
      formData.append("spotId", selectedSpotId);
    }

    try {
      const response = await fetch("/api/post", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create post.");
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
      <h1 className="text-2xl font-bold mb-4">Create New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700"
          >
            Image
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {previewUrl && (
            <div className="mt-4">
              <Image
                src={previewUrl}
                alt="Uploaded image"
                width={500} // Specify appropriate width
                height={300} // Specify appropriate height
                className="max-w-full h-auto rounded-md"
              />
            </div>
          )}
        </div>

        {/* Spot Selection Mode */}
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="spotMode"
              value="new"
              checked={spotMode === "new"}
              onChange={() => setSpotMode("new")}
            />
            <span className="ml-2">Create New Spot</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="spotMode"
              value="existing"
              checked={spotMode === "existing"}
              onChange={() => setSpotMode("existing")}
            />
            <span className="ml-2">Select Existing Spot</span>
          </label>
        </div>

        {spotMode === "new" ? (
          <>
            <div>
              <label
                htmlFor="newSpotName"
                className="block text-sm font-medium text-gray-700"
              >
                New Spot Name
              </label>
              <input
                type="text"
                id="newSpotName"
                name="newSpotName"
                value={newSpotName}
                onChange={(e) => setNewSpotName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>

            <div>
              <label
                htmlFor="newSpotCityId"
                className="block text-sm font-medium text-gray-700"
              >
                New Spot City ID
              </label>
              <input
                type="number"
                id="newSpotCityId"
                name="newSpotCityId"
                value={newSpotCityId}
                onChange={(e) => setNewSpotCityId(Number(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
          </>
        ) : (
          <div>
            <label
              htmlFor="existingSpot"
              className="block text-sm font-medium text-gray-700"
            >
              Select Existing Spot
            </label>
            <select
              id="existingSpot"
              name="existingSpot"
              value={selectedSpotId}
              onChange={(e) => setSelectedSpotId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            >
              {existingSpots.map((spot) => (
                <option key={spot.id} value={spot.id}>
                  {spot.name} (City ID: {spot.cityId})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          ></textarea>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Create Post"}
        </button>
      </form>
    </div>
  );
}
