# Architecture Guidelines

## DDD Implementation Strategy

このドキュメントは、本プロジェクトにおけるDomain-Driven Design (DDD) の実装方針を記載しています。今後の開発においても、この方針に従って実装を進めてください。

## ディレクトリ構成

```
src/
├── domain/              # ドメイン層
│   ├── common/          # 共通の値オブジェクト・エンティティ
│   ├── post/            # Post集約
│   ├── photo/           # Photo集約
│   ├── spot/            # Spot集約
│   └── user/            # User集約
├── repositories/        # インフラ層（リポジトリ実装）
├── services/            # アプリケーション層（サービス）
├── controller/          # プレゼンテーション層（コントローラ）
└── dto/                 # データ転送オブジェクト
```

## エンティティの実装方針

### カプセル化

**すべてのエンティティは、プライベートフィールドとゲッターを使用してカプセル化する。**

```typescript
export class PostEntity {
  private readonly _id: PostId;
  private _description: PostDescription;
  // ...

  constructor(id: PostId, description: PostDescription) {
    this._id = id;
    this._description = description;
  }

  get id(): PostId {
    return this._id;
  }

  get description(): PostDescription {
    return this._description;
  }

  // 状態変更はメソッドを通じて行う
  updateDescription(description: PostDescription): void {
    this._description = description;
    this._updatedAt = new UpdatedAt(new Date());
  }
}
```

**理由:**

- 外部から直接フィールドにアクセスできないようにする
- 状態変更時に不変条件（invariants）を強制できる
- 副作用（例: `updatedAt` の更新）を管理できる

## 値オブジェクトの実装方針

### カプセル化と不変性

**すべての値オブジェクトは、プライベートフィールドとゲッターを使用し、immutableにする。**

```typescript
export class PostDescription {
  private readonly _value: string;

  constructor(value: string) {
    if (!PostDescription.isValid(value)) {
      throw new Error("Invalid PostDescription");
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: PostDescription): boolean {
    return this._value === other.value;
  }

  static isValid(value: string): boolean {
    return value.length > 0 && value.length <= 255;
  }
}
```

**理由:**

- 値オブジェクトは変更不可能である必要がある
- バリデーションロジックをコンストラクタに集約
- `equals` メソッドで値の等価性を判定

### 共通の値オブジェクト基底クラス

以下の基底クラスを提供しています:

- `UUID`: UUID形式の識別子
- `Url`: URL形式の文字列
- `StringValue`: 単純な文字列
- `NumberValue`: 単純な数値
- `DateTime`: 日時

これらを継承して、ドメイン固有の値オブジェクトを定義します。

```typescript
export class PostId extends UUID {}
export class PhotoUrl extends Url {}
```

## リポジトリの実装方針

### 依存性逆転の原則（DIP）

**リポジトリインターフェースはドメイン層に定義し、実装はインフラ層に配置する。**

```
domain/
└── post/
    ├── post.entity.ts
    └── post-repository.interface.ts  # インターフェース

repositories/
└── postRepository.ts  # 実装
```

**インターフェース (domain/post/post-repository.interface.ts):**

```typescript
export interface IPostRepository {
  save(post: PostEntity): Promise<void>;
  findById(id: string): Promise<PostEntity | null>;
}
```

**実装 (repositories/postRepository.ts):**

```typescript
@injectable()
export class PostRepository implements IPostRepository {
  async save(post: PostEntity): Promise<void> {
    // 実装
  }
  
  async findById(id: string): Promise<PostEntity | null> {
    // 実装
  }
}
```

**理由:**

- ドメイン層がインフラ層に依存しない
- テスト時にモックリポジトリを簡単に差し替えられる
- インフラ層の変更がドメイン層に影響しない

## サービス層の実装方針

### インターフェースへの依存

**サービスはリポジトリの具象クラスではなく、インターフェースに依存する。**

```typescript
@injectable()
export class PostService {
  constructor(
    @inject(TYPES.PostRepository) private postRepository: IPostRepository,
    @inject(TYPES.PhotoRepository) private photoRepository: IPhotoRepository,
    @inject(TYPES.SpotRepository) private spotRepository: ISpotRepository,
  ) {}
}
```

**理由:**

- 依存性逆転の原則（DIP）に従う
- テスタビリティが向上
- 疎結合な設計

## 依存性注入（DI）の設定

### InversifyJS

`inversify.config.ts` でインターフェースと実装をバインドします。

```typescript
// リポジトリのバインド
container.bind<IPostRepository>(TYPES.PostRepository).to(PostRepository);
container.bind<IPhotoRepository>(TYPES.PhotoRepository).to(PhotoRepository);
container.bind<ISpotRepository>(TYPES.SpotRepository).to(SpotRepository);
```

**注意点:**

- バインドは必ずインターフェース型を使用する
- `TYPES` 定数は `src/constants/types.ts` で定義

## DTO（Data Transfer Object）

### DTOマッパー

エンティティと外部レイヤー（API、DB）の間でデータをやり取りする際は、DTOマッパーを使用します。

```typescript
export const PostDtoMapper = {
  fromEntity(entity: PostEntity): PostDto {
    return {
      id: entity.id.value,
      userId: entity.userId.value,
      description: entity.description.value,
      // ...
    };
  },

  toEntity(dto: PostDto): PostEntity {
    return new PostEntity(
      new PostId(dto.id),
      new UserId(dto.userId),
      new PostDescription(dto.description),
      // ...
    );
  },
};
```

**理由:**

- ドメインモデルとデータストアの表現を分離
- ドメインロジックが外部の変更に影響されない

## まとめ

### DDDの核となる原則

1. **カプセル化**: すべてのエンティティと値オブジェクトはプライベートフィールドとゲッターを使用
2. **不変性**: 値オブジェクトは不変
3. **依存性逆転**: リポジトリインターフェースはドメイン層に配置
4. **疎結合**: サービスはインターフェースに依存
5. **バリデーション**: ドメインルールはドメイン層で検証

### チェックリスト

新しい機能を追加する際は、以下を確認してください:

- [ ] エンティティはプライベートフィールド + ゲッターで実装されているか
- [ ] 値オブジェクトは不変か
- [ ] リポジトリインターフェースはドメイン層に定義されているか
- [ ] サービスはインターフェースに依存しているか
- [ ] DIコンテナでインターフェースがバインドされているか
