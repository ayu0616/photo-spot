import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { PhotoForPostDto } from "@/dto/post-dto";
import { formatFocalLength } from "@/lib/format-exif";

interface DetailedExifInfoProps {
  photo: PhotoForPostDto;
}

export const DetailedExifInfo: React.FC<DetailedExifInfoProps> = ({
  photo,
}) => {
  const detailedInfo = [
    { label: "カメラメーカー", value: photo.cameraMake || "-" },
    { label: "Orientation", value: photo.orientation || "-" },
    { label: "レンズメーカー", value: photo.lensMake || "-" },
    { label: "レンズシリアル", value: photo.lensSerial || "-" },
    {
      label: "35mm 換算焦点距離",
      value: formatFocalLength(photo.focalLength35mm),
    },
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
      </CardContent>
    </Card>
  );
};
