// src/app/upload/page.tsx

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UploadPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [spotName, setSpotName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [cityId, setCityId] = useState<number>(1); // Default to a city ID, will be dynamic later
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

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

    if (!imageFile || !spotName || !description || !cityId) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("spotName", spotName);
    formData.append("description", description);
    formData.append("cityId", cityId.toString());
    formData.append("userId", "some-user-id"); // TODO: Replace with actual user ID from session

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

        <div>
          <label
            htmlFor="spotName"
            className="block text-sm font-medium text-gray-700"
          >
            Spot Name
          </label>
          <input
            type="text"
            id="spotName"
            name="spotName"
            value={spotName}
            onChange={(e) => setSpotName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>

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

        <div>
          <label
            htmlFor="cityId"
            className="block text-sm font-medium text-gray-700"
          >
            City ID
          </label>
          <input
            type="number"
            id="cityId"
            name="cityId"
            value={cityId}
            onChange={(e) => setCityId(Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
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
