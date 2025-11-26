import type { DTO } from "@/features/common/dto";

export interface Entity<D extends DTO> {
  toDTO(): D;
}
