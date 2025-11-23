"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <Button
      type="button"
      onClick={() => signIn("google", { redirect: true, redirectTo: "/" })}
    >
      Signin with Google
    </Button>
  );
}
