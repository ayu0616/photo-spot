import type { DTO } from "@/dto/dto";

export interface Entity<D extends DTO> {
  toDTO(): D;
}
