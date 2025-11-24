import { ExternalLink, MapPin } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { formatGPSCoordinate } from "@/lib/format-exif";

interface LocationInfoProps {
  latitude: string | null;
  longitude: string | null;
}

export const LocationInfo: React.FC<LocationInfoProps> = ({
  latitude,
  longitude,
}) => {
  if (!latitude || !longitude) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex flex-col space-y-1 min-w-0">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              撮影位置
            </div>
            <div className="text-sm font-semibold text-foreground truncate">
              {formatGPSCoordinate(latitude)}, {formatGPSCoordinate(longitude)}
            </div>
          </div>
        </div>
        <Button asChild size="default" className="w-full sm:w-auto sm:shrink-0">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            地図で表示
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
};
