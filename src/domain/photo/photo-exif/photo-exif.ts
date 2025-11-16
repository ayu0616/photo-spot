// src/domain/photo/photo-exif/photo-exif.ts

export class PhotoExif {
  readonly value: string | null;

  constructor(value: string | null) {
    if (value !== null && !PhotoExif.isValid(value)) {
      throw new Error("Invalid PhotoExif");
    }
    this.value = value;
  }

  equals(other: PhotoExif): boolean {
    return this.value === other.value;
  }

  static isValid(value: string): boolean {
    try {
      JSON.parse(value);
      return true;
    } catch (_e) {
      return false;
    }
  }
}
