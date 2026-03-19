---
sidebar_position: 3
slug: /reference/config/defaults
---

# defaults（@default）

Prisma の `@default()` に相当する機能です。`create` 時にフィールドのデフォルト値を自動設定します。

## 基本的な使い方

```ts
const gassma = new Gassma.GassmaClient({
  defaults: {
    Users: {
      role: "USER",
      createdAt: () => new Date(),
    },
  },
});

// create 時にデフォルト値が自動適用
gassma.sheets.Users.create({
  data: { name: "Alice" },
});
// => { name: "Alice", role: "USER", createdAt: 2026-03-14T... }
```

## 静的値と関数

デフォルト値には固定値と関数の両方を指定できます。

| 指定方法 | 例 | 動作 |
| --- | --- | --- |
| 静的値 | `role: "USER"` | 毎回同じ値を設定 |
| 関数 | `createdAt: () => new Date()` | 呼び出しごとに評価 |

## 適用されるメソッド

| メソッド | 適用 |
| --- | --- |
| `create` | ✅ |
| `createMany` / `createManyAndReturn` | ✅ |
| `upsert`（create 部分のみ） | ✅ |

## 明示指定時の動作

フィールドが明示的に指定されている場合（`null` を含む）、デフォルト値は適用されません。

```ts
gassma.sheets.Users.create({
  data: { name: "Alice", role: "ADMIN" },
});
// => role は "ADMIN"（デフォルト値 "USER" は適用されない）
```
