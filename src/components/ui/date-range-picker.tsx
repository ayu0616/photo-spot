"use client";

import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (dateRange: DateRange | undefined) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-3 w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between font-normal"
          >
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "yyyy/MM/dd")} -{" "}
                  {format(value.to, "yyyy/MM/dd")}
                </>
              ) : (
                format(value.from, "yyyy/MM/dd")
              )
            ) : (
              <span>日付範囲を選択</span>
            )}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="range"
            selected={value}
            onSelect={(range) => {
              onChange(range);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
