export const formatAperture = (value: string | null | undefined): string => {
  if (value === null || value === undefined) {
    return "-";
  }
  // If it's already in f/X format, return as is
  if (value.startsWith("f/")) {
    return value;
  }

  // Handle fractional values like "9/2"
  if (value.includes("/")) {
    const parts = value.split("/");
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      if (
        !Number.isNaN(numerator) &&
        !Number.isNaN(denominator) &&
        denominator !== 0
      ) {
        const result = numerator / denominator;
        return `f/${result.toFixed(1)}`;
      }
    }
  }

  // Try to parse as a number and format
  const num = parseFloat(value);
  if (!Number.isNaN(num)) {
    return `f/${num.toFixed(1)}`; // Format to one decimal place
  }
  return value; // Return original if not parsable
};

export const formatFocalLength = (value: string | null | undefined): string => {
  if (value === null || value === undefined) {
    return "-";
  }
  // If it already contains "mm", return as is
  if (value.includes("mm")) {
    return value;
  }

  // Handle fractional values like "6249513/1000000"
  if (value.includes("/")) {
    const parts = value.split("/");
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      if (
        !Number.isNaN(numerator) &&
        !Number.isNaN(denominator) &&
        denominator !== 0
      ) {
        const result = numerator / denominator;
        // Format to max 2 decimal places, removing trailing zeros if integer
        return `${parseFloat(result.toFixed(2))}mm`;
      }
    }
  }

  // Try to parse as a number and add "mm"
  const num = parseFloat(value);
  if (!Number.isNaN(num)) {
    return `${num}mm`;
  }
  return value; // Return original if not parsable
};

export const formatISO = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "-";
  }
  return `ISO ${value}`;
};

export const formatShutterSpeed = (
  value: string | null | undefined,
): string => {
  if (value === null || value === undefined) {
    return "-";
  }
  // Assuming shutter speed might come as a decimal (e.g., 0.004) or fraction (e.g., 1/250)
  // Convert decimal to fraction if it's less than 1 and has many decimal places
  const num = parseFloat(value);
  if (!Number.isNaN(num) && num < 1 && num > 0) {
    // Attempt to convert to a common fraction like 1/X
    const reciprocal = 1 / num;
    if (Number.isInteger(reciprocal)) {
      return `1/${reciprocal}`;
    }
  }
  return value;
};

// This is a placeholder for more advanced GPS formatting if needed
export const formatGPSCoordinate = (
  value: string | null | undefined,
): string => {
  if (value === null || value === undefined) {
    return "-";
  }
  return value;
};
