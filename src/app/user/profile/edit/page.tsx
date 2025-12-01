"use client";

import { useSession } from "@hono/auth-js/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserDto } from "@/features/user/UserDto";
import { honoClient } from "@/lib/hono";

const fetchUserProfile = async (): Promise<UserDto> => {
  const response = await honoClient.user.profile.$get();
  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }
  const user = await response.json();
  return {
    ...user,
    emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
  };
};

const updateUserName = async (name: string): Promise<UserDto> => {
  const response = await honoClient.user.profile.$put({
    json: { name },
  });
  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage =
      typeof errorData.error === "string"
        ? errorData.error
        : JSON.stringify(errorData.error);
    throw new Error(errorMessage || "Failed to update user name");
  }
  const user = await response.json();
  return {
    ...user,
    emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
  };
};

export default function EditProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [userName, setUserName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
  } = useQuery<UserDto, Error>({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    enabled: status === "authenticated", // Only fetch if authenticated
  });

  const { mutate, isPending: isUpdating } = useMutation<UserDto, Error, string>(
    {
      mutationFn: updateUserName,
      onSuccess: (_data) => {
        setSuccess("ユーザー名が更新されました！");
        setError(null);
        // Invalidate and refetch the user profile query to get the updated name
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        // Optionally, update the session in the client to reflect the new name immediately
        // This might require a custom solution depending on how session is managed by @hono/auth-js/react
        // For now, relying on refetching userProfile and potentially a page refresh to update session data
      },
      onError: (err) => {
        setError(err.message);
        setSuccess(null);
      },
    },
  );

  useEffect(() => {
    if (userProfile?.name) {
      setUserName(userProfile.name);
    }
  }, [userProfile]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim() === "") {
      setError("ユーザー名は必須です。");
      return;
    }
    mutate(userName);
  };

  if (status === "loading" || isProfileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isProfileError) {
    return (
      <div className="text-center text-red-500 my-8">
        プロフィールの読み込み中にエラーが発生しました: {profileError?.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">
        プロフィールを編集
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="userName">ユーザー名</Label>
          <Input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            disabled={isUpdating}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}

        <Button type="submit" className="w-full" disabled={isUpdating}>
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          更新
        </Button>
      </form>
    </div>
  );
}
