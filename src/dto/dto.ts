export interface DTO
  extends Record<string, string | number | boolean | Date | null | DTO> {}
