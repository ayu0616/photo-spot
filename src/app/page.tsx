import { PostList } from "@/components/post/post-list";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 container mx-auto">
      <PostList />
    </main>
  );
}
