import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { PhotoForPost } from "@/features/post/service";
import { formatDateTime } from "@/lib/format-date";
import {
  convertCameraModelName,
  formatAperture,
  formatFocalLength,
  formatISO,
  formatShutterSpeed,
} from "@/lib/format-exif";

interface DetailedExifInfoProps {
  photo: NonNullable<PhotoForPost>;
}

export const DetailedExifInfo: React.FC<DetailedExifInfoProps> = ({
  photo,
}) => {
  const detailedInfo = [
    {
      label: "撮影日時",
      value: photo.takenAt ? formatDateTime(new Date(photo.takenAt)) : "-",
    },
    { label: "カメラメーカー", value: photo.cameraMake || "-" },
    { label: "カメラモデル", value: convertCameraModelName(photo.cameraModel) },
    { label: "レンズメーカー", value: photo.lensMake || "-" },
    { label: "レンズモデル", value: photo.lensModel || "-" },
    { label: "レンズシリアル", value: photo.lensSerial || "-" },
    {
      label: "焦点距離",
      value: formatFocalLength(photo.focalLength),
    },
    {
      label: "35mm 換算焦点距離",
      value: formatFocalLength(photo.focalLength35mm),
    },
    {
      label: "絞り",
      value: formatAperture(photo.aperture),
    },
    {
      label: "ISO",
      value: formatISO(photo.iso),
    },
    {
      label: "シャッター速度",
      value: formatShutterSpeed(photo.shutterSpeed),
    },
    { label: "Orientation", value: photo.orientation || "-" },
  ];

  // 全ての値が "-" の場合は表示しない
  const hasValidData = detailedInfo.some((item) => item.value !== "-");

  if (!hasValidData) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>詳細な撮影情報</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop View */}
        <div className="hidden md:block">
          <Table>
            <TableBody>
              {detailedInfo
                .filter((item) => item.value !== "-")
                .map((item) => (
                  <TableRow key={item.label}>
                    <TableCell className="font-medium w-1/3">
                      {item.label}
                    </TableCell>
                    <TableCell className="w-2/3">{item.value}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden space-y-4">
          {detailedInfo
            .filter((item) => item.value !== "-")
            .map((item) => (
              <div key={item.label} className="border-b pb-2 last:border-0">
                <div className="text-xs text-muted-foreground mb-1">
                  {item.label}
                </div>
                <div className="text-sm ml-2">{item.value}</div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};
