"use client";

import { Check, Share2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createSquareImageFile } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

interface Photo {
  id: string;
  url: string;
}

interface Post {
  id: string;
  photo: Photo;
}

interface TripShareDialogProps {
  posts: Post[];
  tripTitle: string;
}

export function TripShareDialog({ posts, tripTitle }: TripShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [isSharing, setIsSharing] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedPostIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleShare = async () => {
    if (selectedPostIds.length === 0) return;

    setIsSharing(true);
    try {
      const selectedPosts = posts.filter((p) => selectedPostIds.includes(p.id));

      const files = await Promise.all(
        selectedPosts.map((post) =>
          createSquareImageFile(post.photo.url, `trip-${post.id}.jpg`),
        ),
      );

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files })
      ) {
        await navigator.share({
          files: files,
          title: tripTitle,
          text: `旅行「${tripTitle}」の思い出を共有します。`,
        });
      } else {
        // フォールバック: 画像をダウンロード
        for (const file of files) {
          const url = URL.createObjectURL(file);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error("Failed to share images:", error);
      alert("画像の共有に失敗しました。");
    } finally {
      setIsSharing(false);
      setIsOpen(false);
      setSelectedPostIds([]); // リセット
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          共有
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>画像を共有</DialogTitle>
          <DialogDescription>
            共有したい画像を選択してください（複数選択可）。
            正方形に加工されて共有されます。
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2 my-4 p-1 overflow-y-auto min-h-[200px]">
          {posts.map((post) => {
            const isSelected = selectedPostIds.includes(post.id);
            return (
              <button
                type="button"
                key={post.id}
                className={cn(
                  "relative aspect-square cursor-pointer rounded-md overflow-hidden border-2 transition-all p-0",
                  isSelected
                    ? "border-primary/90 ring-2 ring-primary/90"
                    : "border-transparent hover:border-gray-300",
                )}
                onClick={() => toggleSelect(post.id)}
              >
                <Image
                  src={post.photo.url}
                  alt=""
                  fill
                  className="object-cover"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
          {posts.length === 0 && (
            <div className="col-span-3 text-center py-8 text-gray-500">
              画像がありません
            </div>
          )}
        </div>

        <DialogFooter className="flex-row justify-between items-center sm:justify-between">
          <div className="text-sm text-gray-500">
            {selectedPostIds.length} 枚選択中
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isSharing}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleShare}
              disabled={selectedPostIds.length === 0 || isSharing}
              className="gap-2"
            >
              {isSharing ? "準備中..." : "確定して共有"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
