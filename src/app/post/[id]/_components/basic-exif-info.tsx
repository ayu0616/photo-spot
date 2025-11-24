import type React from "react";
import type { PhotoForPostDto } from "@/dto/post-dto";
import {
  formatAperture,
  formatFocalLength,
  formatISO,
  formatShutterSpeed,
} from "@/lib/format-exif";

interface BasicExifInfoProps {
  photo: PhotoForPostDto;
}

export const BasicExifInfo: React.FC<BasicExifInfoProps> = ({ photo }) => {
  const shutterSpeed = formatShutterSpeed(photo.shutterSpeed);
  const formattedSettings = [
    formatFocalLength(photo.focalLength),
    formatAperture(photo.aperture),
    shutterSpeed !== "-" ? `${shutterSpeed}s` : null,
    formatISO(photo.iso),
  ]
    .filter((item) => item && item !== "-")
    .join(", ");

  return (
    <div className="mt-6 space-y-6">
      <div className="text-center space-y-1">
        <h3 className="font-bold text-lg">
          {photo.cameraModel || "Unknown Camera"}
        </h3>
        {photo.lensModel && (
          <p className="text-sm font-medium">{photo.lensModel}</p>
        )}
        <p className="text-sm text-muted-foreground">{formattedSettings}</p>
      </div>
    </div>
  );
};
