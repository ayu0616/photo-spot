import {
  Aperture,
  Calendar,
  Camera,
  ExternalLink,
  Focus,
  Gauge,
  MapPin,
  Timer,
} from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import type { PhotoForPostDto } from "@/dto/post-dto";
import { formatDateTime } from "@/lib/format-date";
import {
  formatAperture,
  formatFocalLength,
  formatGPSCoordinate,
  formatISO,
  formatShutterSpeed,
} from "@/lib/format-exif";

interface BasicExifInfoProps {
  photo: PhotoForPostDto;
}

export const BasicExifInfo: React.FC<BasicExifInfoProps> = ({ photo }) => {
  const basicInfo = [
    {
      label: "撮影日時",
      value: photo.takenAt ? formatDateTime(new Date(photo.takenAt)) : "-",
      icon: Calendar,
    },
    {
      label: "カメラ",
      value: photo.cameraModel || "-",
      icon: Camera,
    },
    {
      label: "レンズ",
      value: photo.lensModel || "-",
      icon: Focus,
    },
    {
      label: "焦点距離",
      value: formatFocalLength(photo.focalLength),
      icon: Focus,
    },
    {
      label: "絞り",
      value: formatAperture(photo.aperture),
      icon: Aperture,
    },
    {
      label: "ISO",
      value: formatISO(photo.iso),
      icon: Gauge,
    },
    {
      label: "シャッター",
      value: formatShutterSpeed(photo.shutterSpeed),
      icon: Timer,
    },
  ];

  const hasLocation = photo.latitude && photo.longitude;

  return (
    <div className="mt-6 space-y-4">
      {/* 基本情報グリッド */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {basicInfo.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.label}
              className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-2.5 md:p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
            >
              <div className="flex items-start gap-2 md:gap-3">
                <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400 shrink-0 mt-0.5" />
                <div className="flex flex-col space-y-0.5 md:space-y-1 min-w-0 flex-1">
                  <div className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {item.label}
                  </div>
                  <div className="text-xs md:text-sm font-semibold text-gray-900 dark:text-gray-100 wrap-break-word">
                    {item.value}
                  </div>
                </div>
              </div>
              {/* ホバーエフェクト用のグラデーション */}
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-200 pointer-events-none" />
            </div>
          );
        })}
      </div>

      {/* 位置情報 */}
      {hasLocation && (
        <div className="relative overflow-hidden rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex flex-col space-y-1 min-w-0">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  撮影位置
                </div>
                <div className="text-sm font-semibold text-foreground truncate">
                  {formatGPSCoordinate(photo.latitude)},{" "}
                  {formatGPSCoordinate(photo.longitude)}
                </div>
              </div>
            </div>
            <Button asChild size="default">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${photo.latitude},${photo.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                地図で表示
                <ExternalLink />
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
