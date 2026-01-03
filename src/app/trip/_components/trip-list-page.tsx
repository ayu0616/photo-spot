"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { YearLoading } from "./year-loading";
import { YearSelect } from "./year-select";

interface Trip {
  id: string;
  title: string;
  description: string | null;
  startedAt: string;
  endedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const TripListPage = ({
  trips,
  year: defaultYear,
}: {
  trips: Trip[];
  year: number;
}) => {
  const [year, setYear] = useState(defaultYear);
  const router = useRouter();

  const handleYearChange = (year: number) => {
    setYear(year);
    router.push(`/trip?year=${year}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{year}年の旅行</h1>
        <YearSelect year={year} onChange={handleYearChange} />
        <YearLoading year={year}>
          <div>{JSON.stringify(trips)}</div>
        </YearLoading>
      </div>
    </div>
  );
};
