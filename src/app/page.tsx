import { PostListContainer } from "@/components/post/post-list-container";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 container mx-auto">
      <PostListContainer />
    </main>
  );
}
