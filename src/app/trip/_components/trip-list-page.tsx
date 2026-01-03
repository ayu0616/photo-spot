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
  year,
}: {
  trips: Trip[];
  year: number;
}) => {
  return (
    <YearLoading year={year}>
      <YearSelect year={year} />
      {JSON.stringify(trips)}
    </YearLoading>
  );
};
