"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { YearLoading } from "./year-loading";
import { YearSelect } from "./year-select";

interface Trip {
  id: string;
  title: string;
  description: string | null;
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
    <YearLoading year={year}>
      <YearSelect year={year} onChange={handleYearChange} />
      {JSON.stringify(trips)}
    </YearLoading>
  );
};
