---
sidebar_position: 4
slug: /reference/config/updated-at
---

# updatedAt（@updatedAt）

Prisma の `@updatedAt` に相当する機能です。レコードの作成・更新時に指定カラムへ自動的に現在時刻をセットします。

## 基本的な使い方

```ts
const gassma = new Gassma.GassmaClient({
  updatedAt: {
    Users: "updatedAt",
  },
});

// create / update 時に自動で現在時刻がセットされる
gassma.Users.create({
  data: { name: "Alice" },
});
// => { name: "Alice", updatedAt: 2026-03-14T... }

gassma.Users.update({
  where: { name: "Alice" },
  data: { name: "Bob" },
});
// => { name: "Bob", updatedAt: 2026-03-14T... }（自動更新）
```

## 複数カラム対応

配列で複数カラムを指定できます。

```ts
const gassma = new Gassma.GassmaClient({
  updatedAt: {
    Posts: ["updatedAt", "lastModified"],
  },
});
```

## 適用されるメソッド

| メソッド | 適用 |
| --- | --- |
| `create` / `createMany` / `createManyAndReturn` | ✅ |
| `update` / `updateMany` / `updateManyAndReturn` | ✅ |
| `upsert`（create・update 両方） | ✅ |

## 明示指定時の動作

ユーザーが明示的に値を指定した場合、そちらが優先されます。

## 注意事項

`onDelete` / `onUpdate` の連鎖更新では `updatedAt` は適用されません（Prisma と同様の挙動）。
