import Link from "next/link";

export default function Page() {
  return (
    <div className="p-6 container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin</h1>
      <p>
        <Link href={"/admin/trips"}>旅行</Link>
      </p>
    </div>
  );
}
