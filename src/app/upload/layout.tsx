import { redirect } from "next/navigation";
import type React from "react";
import { auth } from "@/app/api/auth/[...nextAuth]/auth";

export default async function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}
