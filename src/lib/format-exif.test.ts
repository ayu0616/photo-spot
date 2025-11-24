import { describe, expect, it } from "vitest";
import { formatFocalLength } from "./format-exif";

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
