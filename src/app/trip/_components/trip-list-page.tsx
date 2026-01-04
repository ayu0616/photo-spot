"use client";

import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
  spotNames: string[];
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
    history.replaceState(null, "", `/trip?year=${year}`);
    router.replace(`/trip?year=${year}`);
  };

  useEffect(() => {
    setYear(defaultYear);
  }, [defaultYear]);

  // 月ごとにグループ化
  const groupedTrips = useMemo(() => {
    const groups: Record<number, Trip[]> = {};
    for (const trip of trips) {
      const month = parseISO(trip.startedAt).getMonth() + 1;
      if (!groups[month]) {
        groups[month] = [];
      }
      groups[month].push(trip);
    }
    // 月の降順でソートした配列を返す
    return Object.entries(groups).map(([month, items]) => ({
      month: Number.parseInt(month, 10),
      trips: items,
    }));
  }, [trips]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="space-y-10">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {year}年の旅行
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            その年に行った思い出の場所を振り返りましょう。
          </p>
          <div className="pt-2">
            <YearSelect year={year} onChange={handleYearChange} />
          </div>
        </header>

        <YearLoading year={year}>
          <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
            {groupedTrips.length > 0 ? (
              groupedTrips.map(({ month, trips }) => {
                return (
                  <div key={month} className="relative">
                    {/* 月の見出し */}
                    <div className="flex items-center mb-8">
                      <div className="absolute left-0 translate-x-3.5 w-4 h-4 rounded-full border-4 border-background bg-primary shadow-sm z-30" />
                      <div className="ml-12">
                        <h2 className="text-2xl font-bold text-primary">
                          {month}月
                        </h2>
                      </div>
                    </div>

                    {/* その月の旅行リスト */}
                    <div className="space-y-6">
                      {trips.map((trip) => (
                        <TripItem key={trip.id} trip={trip} />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
                <p className="text-muted-foreground">
                  この年の旅行データはありません。
                </p>
              </div>
            )}
          </div>
        </YearLoading>
      </div>
    </div>
  );
};

const TripItem = ({ trip }: { trip: Trip }) => {
  const startDate = parseISO(trip.startedAt);
  const endDate = parseISO(trip.endedAt);

  const dateDisplay = useMemo(() => {
    const startFormatted = format(startDate, "M/d", { locale: ja });
    const endFormatted = format(endDate, "M/d", { locale: ja });

    if (startFormatted === endFormatted) {
      return startFormatted;
    }

    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startFormatted} - ${format(endDate, "d", { locale: ja })}`;
    }

    return `${startFormatted} - ${endFormatted}`;
  }, [startDate, endDate]);

  return (
    <div className="relative flex items-center group">
      {/* タイムラインのドット（アイテムごと） */}
      <div className="absolute left-0 translate-x-3.5 w-3 h-3 rounded-full border-2 border-background bg-border group-hover:bg-primary group-hover:scale-125 transition-all duration-200 z-20" />
      {/* コンテンツ */}
      <div className="w-full grid grid-cols-[calc(var(--spacing)*12)_1fr]">
        <div className="w-12"></div>
        <div className="">
          <Link href={`/trip/${trip.id}`} className="block">
            <div className="relative p-6 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group-hover:border-primary/30 overflow-hidden">
              {/* 装飾用グラデーション */}
              <div className="absolute -inset-px bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="space-y-4 relative z-10">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors duration-300">
                    {trip.title}
                  </h3>
                  {trip.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {trip.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap flex-1 line-clamp-1 gap-2">
                  {trip.spotNames.map((spotName) => (
                    <Badge variant="secondary" key={spotName}>
                      {spotName}
                    </Badge>
                  ))}
                </div>

                <div className="pt-2 flex items-center text-xs text-muted-foreground/80 gap-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{dateDisplay}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
