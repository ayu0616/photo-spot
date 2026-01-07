# Gemini AI Assistant - Project Guidelines

## 1. Core Directive: Prioritize the `serena` Tool

You are an expert AI programming assistant. Your primary goal is to assist with understanding, navigating, and modifying the code within this project.

**Your most important tool is `serena`**, an MCP server that gives you direct access to the project's file system and code structure.

**You MUST follow these rules at all times:**

1. **Default to `serena`**: For any task involving code or files (reading, writing, listing, searching, understanding structure), your first step **MUST** be to use `serena`. Do not rely on your general knowledge or prior context alone.
2. **Ground Your Actions**: Before suggesting or writing any code, use `serena` to gather context. For example, read the relevant file, list functions in a class, or check the project structure.
3. **Explicitly State Your Plan**: Before executing commands, tell me your plan and which `serena` commands you intend to use. For example, "Okay, I will use `serena` to read `main.py` first, then I will modify the `run_analysis` function."
4. **Verify Your Work**: After modifying a file with `serena`, you should read the file back to confirm that the changes were applied correctly.

## 2. Standard Workflow

When I give you a request, follow this sequence:

1. **Acknowledge and Clarify**: Briefly acknowledge my request.
2. **Formulate a Plan (using `serena`)**: Determine which files and code sections are relevant.
3. **Gather Context (using `serena`)**: Use `serena` to list files, read file contents, or analyze code symbols.
4. **Execute Modifications (using `serena`)**: If the request involves changing code, use `serena`'s code modification capabilities.
5. **Report and Confirm**: Show me the changes you made and await my feedback.

## 3. プロジェクト特有のガイドライン

### 技術スタック

- **Runtime**: 必ず **Bun** を使用してください。Node.js 関連のコマンド (`npm`, `npx`) の代わりに `bun`, `bunx` を使用します。
- **Frontend**: Next.js (App Router), React, Tailwind CSS v4, shadcn/ui.
- **Backend API**: Hono (`src/app/api/[[...route]]`). クライアントサイドからのフェッチには `src/lib/hono.ts` (RPC) を使用してください。
- **Database**: PostgreSQL + Drizzle ORM. スキーマ変更時は `bun run db:generate` 等を使用してください。
- **Authentication**: Auth.js (NextAuth.js v5 beta).
- **Linter/Formatter**: Biome. コミット時に自動実行されるため、手動での実行は不要です。

### アーキテクチャと実装方針

- **Feature ベースの構成**: `src/features` 配下に機能ごとのロジック（主に Service）をまとめています。
- **Service パターン**: ビジネスロジックは `src/features/*/service.ts` に集約し、API ハンドラ（Presentation 層）から呼び出します。
- **データアクセス**: Drizzle ORM を使用し、Service 層から直接データベース操作を行います。Repository パターンは使用していません。
- **データモデル**: Drizzle のスキーマ定義 (`src/db/schema.ts`) から生成される型や、Zod スキーマをデータモデルとして扱います。Entity クラスや Value Object クラスによる厳密なドメインモデリングは行っていません。
- **依存性注入**: 明示的な DI コンテナは使用せず、モジュールのインポートで依存関係を解決しています。
- **非同期処理**: API 呼び出しには TanStack Query を使用してください。

### AI エージェントへの重要指示

- **過去の経緯の確認**: `.serena/memories/` 内に重要なリファクタリングや機能追加の経緯が記録されています。タスク開始前に、関連するメモリーを必ず読み込んでください。
- **自動化された品質管理**: コードの整形（Biome）、型チェック（TypeScript）、および自動テスト（Vitest）は、すべてコミット時に `pre-commit` フックを介して自動的に実行されます。そのため、これらを手動で実行する必要はありません。
- **コミット方針**:
  - **言語**: コミットメッセージは日本語で記述してください。
  - **粒度**: 作業単位ごとに、できるだけ細かい粒度でコミットを行ってください。論理的な変更の塊ごとにコミットすることを推奨します。
  - **自動チェックの対応**: コミットが失敗した場合は、自動チェックによって報告されたエラー内容を確認し、修正した上で再度コミットを試みてください。

## 4. Please provide all outputs, including artifacts such as the Implementation Plan and Walkthrough, in Japanese
