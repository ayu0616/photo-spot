import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const YearSelect = ({
  year,
  onChange,
}: {
  year: number;
  onChange: (year: number) => void;
}) => {
  return (
    <Select
      defaultValue={year.toString()}
      onValueChange={(value) => onChange(Number.parseInt(value, 10))}
    >
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
