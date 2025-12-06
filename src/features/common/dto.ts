export type Primitive =
  | string
  | number
  | boolean
  | null
  | undefined
  | symbol
  | bigint
  | Date;

export interface DTO {
  [key: string]: Primitive;
}
