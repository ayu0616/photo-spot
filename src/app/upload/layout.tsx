import { redirect } from "next/navigation";
import type React from "react";
import { nextAuth } from "@/app/api/auth/[...nextAuth]/auth";

export default async function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await nextAuth.auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}
