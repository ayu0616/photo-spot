"use client";

import { useSearchParams } from "next/navigation";
import { tripSearchParamsSchema } from "../page";

export const YearLoading = ({
  children,
  year,
}: {
  children: React.ReactNode;
  year: number;
}) => {
  const { year: newYear } = tripSearchParamsSchema.parse(useSearchParams());
  if (newYear !== year) {
    return <div>Loading...</div>;
  }
  return children;
};
