// src/domain/photo/value-object/camera-make.ts

export class CameraMake {
  readonly value: string | null;

  constructor(value: string | null) {
    this.value = value;
  }

  equals(other: CameraMake): boolean {
    return this.value === other.value;
  }
}
