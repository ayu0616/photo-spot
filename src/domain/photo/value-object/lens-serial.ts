// src/domain/photo/value-object/lens-serial.ts

export class LensSerial {
  readonly value: string | null;

  constructor(value: string | null) {
    this.value = value;
  }

  equals(other: LensSerial): boolean {
    return this.value === other.value;
  }
}
