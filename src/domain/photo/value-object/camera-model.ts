// src/domain/photo/value-object/camera-model.ts

export class CameraModel {
  readonly value: string | null;

  constructor(value: string | null) {
    this.value = value;
  }

  equals(other: CameraModel): boolean {
    return this.value === other.value;
  }
}
