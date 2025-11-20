// src/app/post/[id]/_components/photo-exif-display.tsx

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { PhotoForPostDto } from "@/dto/post-dto";
import { formatDateTime } from "@/lib/format-date";

interface PhotoExifDisplayProps {
  photo: PhotoForPostDto;
}

export const PhotoExifDisplay: React.FC<PhotoExifDisplayProps> = ({
  photo,
}) => {
  const exifData = [
    {
      label: "撮影日時",
      value: photo.takenAt ? formatDateTime(new Date(photo.takenAt)) : "-",
    },
    { label: "カメラメーカー", value: photo.cameraMake || "-" },
    { label: "カメラモデル", value: photo.cameraModel || "-" },
    { label: "緯度", value: photo.latitude || "-" },
    { label: "経度", value: photo.longitude || "-" },
    { label: "Orientation", value: photo.orientation || "-" },
    { label: "ISO 感度", value: photo.iso || "-" },
    { label: "シャッタースピード", value: photo.shutterSpeed || "-" }, // 追加
    { label: "レンズメーカー", value: photo.lensMake || "-" },
    { label: "レンズモデル", value: photo.lensModel || "-" },
    { label: "レンズシリアル", value: photo.lensSerial || "-" },
    { label: "焦点距離", value: photo.focalLength || "-" },
    { label: "35mm 換算焦点距離", value: photo.focalLength35mm || "-" },
    { label: "絞り値", value: photo.aperture || "-" },
  ];

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>撮影情報 (EXIF)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {exifData.map((item) => (
              <TableRow key={item.label}>
                <TableCell className="font-medium w-1/3">
                  {item.label}
                </TableCell>
                <TableCell className="w-2/3">{item.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
