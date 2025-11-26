import { ValueObject } from "@/features/common/value-object";

export class ShutterSpeed extends ValueObject<string> {
  protected constructor(value: string) {
    // protected を維持
    super(value);
  }

  // スタティックファクトリメソッドを追加
  public static of(value: string): ShutterSpeed {
    // ここでバリデーションなどを追加することも可能
    return new ShutterSpeed(value);
  }
}
