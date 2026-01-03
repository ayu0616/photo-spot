"use client";

import { useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { tripSearchParamsSchema } from "../page";

export const YearLoading = ({
  children,
  year,
}: {
  children: React.ReactNode;
  year: number;
}) => {
  const sp = useSearchParams();
  const { year: newYear } = tripSearchParamsSchema.parse(
    Object.fromEntries(sp.entries()),
  );
  if (newYear !== year) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Spinner size={48} className="text-primary" />
      </div>
    );
  }
  return children;
};
