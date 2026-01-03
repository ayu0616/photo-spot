import { describe, expect, it } from "vitest";
import { convertCameraModelName, formatFocalLength } from "./format-exif";

describe("formatFocalLength", () => {
  it("should format a simple integer string", () => {
    expect(formatFocalLength("50")).toBe("50mm");
  });

  it("should format a rational string (numerator/denominator)", () => {
    expect(formatFocalLength("6249513/1000000")).toBe("6.25mm");
  });

  it("should format a rational string that results in an integer", () => {
    expect(formatFocalLength("24/1")).toBe("24mm");
  });

  it("should return original value if already formatted", () => {
    expect(formatFocalLength("24mm")).toBe("24mm");
  });

  it("should return dash for null or undefined", () => {
    expect(formatFocalLength(null)).toBe("-");
    expect(formatFocalLength(undefined)).toBe("-");
  });

  it("should return original value if parsing fails", () => {
    expect(formatFocalLength("invalid")).toBe("invalid");
  });
});

describe("convertCameraModelName", () => {
  it("should convert Sony Model IDs to product names", () => {
    expect(convertCameraModelName("ILCE-7CM2")).toBe("Sony α7C II");
    expect(convertCameraModelName("ILCE-7CR")).toBe("Sony α7CR");
    expect(convertCameraModelName("ILCE-7M4")).toBe("Sony α7 IV");
    expect(convertCameraModelName("ILCE-7SM3")).toBe("Sony α7S III");
    expect(convertCameraModelName("ILCE-7RM5")).toBe("Sony α7R V");
    expect(convertCameraModelName("ILCE-6700")).toBe("Sony α6700");
  });

  it("should handle override cases", () => {
    expect(convertCameraModelName("ILCE-1")).toBe("Sony α1");
    expect(convertCameraModelName("ILCE-9")).toBe("Sony α9");
    expect(convertCameraModelName("ZV-E10M2")).toBe("Sony VLOGCAM ZV-E10 II");
    expect(convertCameraModelName("ILME-FX3")).toBe("Sony FX3");
  });

  it("should return the original ID for unknown models", () => {
    expect(convertCameraModelName("UNKNOWN-CAM")).toBe("UNKNOWN-CAM");
  });

  it("should handle null or empty values", () => {
    expect(convertCameraModelName(null)).toBe("Unknown Camera");
    expect(convertCameraModelName("")).toBe("Unknown Camera");
    expect(convertCameraModelName("   ")).toBe("Unknown Camera");
  });

  it("should be case insensitive and handle whitespace", () => {
    expect(convertCameraModelName("  ilce-7cm2  ")).toBe("Sony α7C II");
  });

  it("should return trimmed input for Canon cameras", () => {
    expect(convertCameraModelName("Canon EOS R5")).toBe("Canon EOS R5");
    expect(convertCameraModelName("  Canon EOS R6  ")).toBe("Canon EOS R6");
  });

  it("should return trimmed input for Nikon cameras", () => {
    expect(convertCameraModelName("Nikon Z7")).toBe("Nikon Z7");
    expect(convertCameraModelName("  Nikon Z6  ")).toBe("Nikon Z6");
  });
});
