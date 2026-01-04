"use client";

import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
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
          <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
            {groupedTrips.length > 0 ? (
              groupedTrips.map(({ month, trips }) => (
                <div key={month} className="relative">
                  {/* 月の見出し */}
                  <div className="md:flex items-center justify-between md:mb-8 mb-4">
                    <div className="flex items-center">
                      <div className="absolute left-0 translate-x-3.5 md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full border-4 border-background bg-primary shadow-sm" />
                      <div className="ml-12 md:ml-0 md:w-1/2 md:pr-12 md:text-right flex-1">
                        <h2 className="text-2xl font-bold text-primary">
                          {month}月
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* その月の旅行リスト */}
                  <div className="space-y-6 ml-12 md:ml-0">
                    {trips.map((trip, tripIndex) => (
                      <TripItem
                        key={trip.id}
                        trip={trip}
                        index={
                          groupedTrips
                            .slice(0, groupedTrips.indexOf({ month, trips }))
                            .reduce((acc, curr) => acc + curr.trips.length, 0) +
                          tripIndex
                        }
                      />
                    ))}
                  </div>
                </div>
              ))
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

const TripItem = ({ trip, index }: { trip: Trip; index: number }) => {
  const startDate = parseISO(trip.startedAt);
  const endDate = parseISO(trip.endedAt);

  const dateDisplay =
    format(startDate, "M/d", { locale: ja }) ===
    format(endDate, "M/d", { locale: ja })
      ? format(startDate, "yyyy年M月d日(E)", { locale: ja })
      : `${format(startDate, "M/d", { locale: ja })} - ${format(endDate, "M/d", { locale: ja })}`;

  const isEven = index % 2 === 0;

  return (
    <div
      className={cn(
        "relative md:flex items-center gap-8 md:gap-0 group",
        isEven ? "md:flex-row" : "md:flex-row-reverse",
      )}
    >
      {/* デスクトップ用：反対側のスペース */}
      <div className="hidden md:block md:w-1/2" />

      {/* タイムラインのドット（アイテムごと） */}
      <div className="absolute left-0 translate-x-3.5 md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full border-2 border-background bg-border group-hover:bg-primary group-hover:scale-125 transition-all duration-300 z-20" />

      {/* コンテンツ */}
      <div className={cn("md:w-1/2 pb-4", isEven ? "md:pl-12" : "md:pr-12")}>
        <Link href={`/trip/${trip.id}`} className="block">
          <div className="relative p-6 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group-hover:border-primary/30 overflow-hidden">
            {/* 装飾用グラデーション */}
            <div className="absolute -inset-px bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* 装飾用背景アイコン */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
              <MapPin className="w-20 h-20" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                  {format(startDate, "M月d日", { locale: ja })}
                </span>
                <div className="p-1 rounded-full bg-muted opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                  <ChevronRight className="w-4 h-4 text-primary" />
                </div>
              </div>

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
  );
};
