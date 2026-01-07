"use client";

import { Camera, Edit, NotebookPen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CreateNoteDialog } from "@/components/post/create-note-dialog";
import { CreatePhotoDialog } from "@/components/post/create-photo-dialog";
import { PostList } from "@/components/post/post-list";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { PostList as PostListType } from "@/features/post/service";
import { TripShareDialog } from "./trip-share-dialog";

interface TripDetailViewProps {
  trip: {
    id: string;
    title: string;
    description: string | null;
    startedAt: string | null;
    endedAt: string | null;
    userId: string;
  };
  posts: PostListType[];
  currentUserId?: string;
  sharePosts: (PostListType & { photo: NonNullable<PostListType["photo"]> })[];
}

export function TripDetailView({
  trip,
  posts,
  currentUserId,
  sharePosts,
}: TripDetailViewProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);

  const isOwner = currentUserId === trip.userId;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h1 className="text-3xl font-bold">{trip.title}</h1>
          <div className="flex gap-2 items-center">
            {isOwner && (
              <div className="flex items-center gap-2 mr-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  編集モード
                </span>
                <Switch
                  checked={isEditMode}
                  onCheckedChange={setIsEditMode}
                  aria-label="編集モード切り替え"
                />
              </div>
            )}
            {isOwner && (
              <Button variant="outline" size="icon" asChild>
                {/* biome-ignore lint/suspicious/noExplicitAny: Route inference issue */}
                <Link href={`/trip/${trip.id}/edit` as any}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">編集</span>
                </Link>
              </Button>
            )}
            {currentUserId && sharePosts.length > 0 && (
              <TripShareDialog posts={sharePosts} tripTitle={trip.title} />
            )}
          </div>
        </div>
        {trip.description && (
          <p className="text-gray-600 mb-2">{trip.description}</p>
        )}
        <p className="text-sm text-gray-500">
          {trip.startedAt} - {trip.endedAt}
        </p>
      </div>

      {isEditMode && (
        <div className="flex gap-4 mb-8 justify-center animate-in fade-in slide-in-from-top-4 duration-300">
          <Button
            className="gap-2 rounded-full shadow-md"
            onClick={() => setIsNoteDialogOpen(true)}
          >
            <NotebookPen className="w-4 h-4" />
            テキストを追加
          </Button>
          <Button
            className="gap-2 rounded-full shadow-md"
            variant="secondary"
            onClick={() => setIsPhotoDialogOpen(true)}
          >
            <Camera className="w-4 h-4" />
            写真を追加
          </Button>
        </div>
      )}

      <PostList allPosts={posts} />

      <CreateNoteDialog
        tripId={trip.id}
        open={isNoteDialogOpen}
        onOpenChange={setIsNoteDialogOpen}
        defaultDate={trip.startedAt ? new Date(trip.startedAt) : undefined}
      />
      <CreatePhotoDialog
        tripId={trip.id}
        open={isPhotoDialogOpen}
        onOpenChange={setIsPhotoDialogOpen}
      />
    </div>
  );
}
