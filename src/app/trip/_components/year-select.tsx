"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const YearSelect = ({ year }: { year: number }) => {
  const router = useRouter();

  const handleChange = (value: string) => {
    router.push(`/trip?year=${value}`);
  };
  return (
    <Select defaultValue={year.toString()} onValueChange={handleChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a year" />
      </SelectTrigger>
      <SelectContent>
        {[...new Array(11)].map((_, index) => (
          <SelectItem
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={year - 5 + index}
            value={(year - 5 + index).toString()}
          >
            {year - 5 + index}年
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
