import React from "react";
import type { PhotoForPostDto } from "@/features/post/PostDto";
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

  const settingsItems: { key: string; node: React.ReactNode }[] = [];

  // Focal Length Logic
  if (photo.focalLength35mm && photo.focalLength35mm !== photo.focalLength) {
    settingsItems.push({
      key: "focal",
      node: (
        <span className="inline-flex items-baseline">
          {formatFocalLength(photo.focalLength35mm)}
          <span className="text-[10px] text-muted-foreground ml-0.5">
            (35mm換算)
          </span>
        </span>
      ),
    });
  } else {
    const formatted = formatFocalLength(photo.focalLength);
    if (formatted && formatted !== "-") {
      settingsItems.push({ key: "focal", node: <span>{formatted}</span> });
    }
  }

  // Aperture
  const aperture = formatAperture(photo.aperture);
  if (aperture && aperture !== "-") {
    settingsItems.push({ key: "aperture", node: <span>{aperture}</span> });
  }

  // Shutter Speed
  if (shutterSpeed && shutterSpeed !== "-") {
    settingsItems.push({
      key: "shutter",
      node: <span>{shutterSpeed}s</span>,
    });
  }

  // ISO
  const iso = formatISO(photo.iso);
  if (iso && iso !== "-") {
    settingsItems.push({ key: "iso", node: <span>{iso}</span> });
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="text-center space-y-1">
        <h3 className="font-bold text-lg">
          {photo.cameraModel || "Unknown Camera"}
        </h3>
        {photo.lensModel && (
          <p className="text-sm font-medium">{photo.lensModel}</p>
        )}
        <p className="text-sm text-muted-foreground">
          {settingsItems.map((item, index) => (
            <React.Fragment key={item.key}>
              {index > 0 && ", "}
              {item.node}
            </React.Fragment>
          ))}
        </p>
      </div>
    </div>
  );
};
