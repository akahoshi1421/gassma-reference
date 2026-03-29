---
sidebar_position: 2
slug: /reference/config/global-omit
---

# グローバル omit

`GassmaClient` のコンストラクタで `omit` を指定すると、指定したシートの全クエリでデフォルトのフィールド除外が適用されます。

## 基本的な使い方

```ts
const gassma = new Gassma.GassmaClient({
  omit: {
    Users: {
      password: true,
      secret: true,
    },
    Posts: {
      internalNotes: true,
    },
  },
});

// Users シートから取得時、password と secret が自動的に除外される
const users = gassma.Users.findMany({});
// => [{ id: 1, name: "Alice", email: "alice@example.com" }, ...]
// password と secret フィールドは含まれない
```

## 優先順位

グローバル omit、クエリレベルの `omit`、`select` には以下の優先順位があります。

| 優先順位 | 条件 | 動作 |
| --- | --- | --- |
| 1（最優先） | `select` が指定 | グローバル omit とクエリ omit を無視 |
| 2 | クエリ `omit` が指定 | グローバル omit とマージ |
| 3 | どちらも未指定 | グローバル omit をそのまま適用 |

### select でグローバル omit を無視

`select` を指定すると、グローバル omit は適用されません。

```ts
// グローバル omit: { password: true }
const result = gassma.Users.findMany({
  select: { name: true, password: true },
});
// => [{ name: "Alice", password: "secret123" }]
// select が最優先のため password も取得できる
```

### クエリ omit でグローバル omit を上書き

クエリレベルの `omit` で `false` を指定すると、グローバル omit を個別に無効化できます。

```ts
// グローバル omit: { password: true, secret: true }
const result = gassma.Users.findMany({
  omit: { password: false },
});
// => [{ id: 1, name: "Alice", password: "secret123" }]
// password のグローバル omit が無効化され、secret のみ除外される
```

クエリ `omit` で `true` を指定すると、追加の除外フィールドを指定できます。

```ts
// グローバル omit: { password: true }
const result = gassma.Users.findMany({
  omit: { email: true },
});
// => [{ id: 1, name: "Alice" }]
// password（グローバル）と email（クエリ）の両方が除外される
```

## 対応メソッド

グローバル omit は以下のメソッドに適用されます。

| メソッド | 適用 |
| --- | --- |
| `findMany` | ✅ |
| `findFirst` / `findFirstOrThrow` | ✅ |
| `create` | ✅ |
| `update` | ✅ |
| `upsert` | ✅ |
| `delete` | ✅ |
| `createManyAndReturn` | ✅ |
| `updateManyAndReturn` | ✅ |

:::note
`createMany`、`updateMany`、`deleteMany` は `{ count: number }` を返すため、グローバル omit の影響を受けません。
:::

## リレーションとの組み合わせ

```ts
const gassma = new Gassma.GassmaClient({
  omit: {
    Users: { password: true },
  },
  relations: {
    Users: {
      posts: { type: "oneToMany", to: "Posts", field: "id", reference: "authorId" },
    },
  },
});

// リレーションと一緒に使用できる
const result = gassma.Users.findMany({
  include: { posts: true },
});
// => [{ id: 1, name: "Alice", posts: [...] }]
// password が除外されつつ、リレーション先のデータも取得
```

## バリデーション

| エラー | 原因 |
| --- | --- |
| `GassmaFindSelectOmitConflictError` | クエリレベルで `select` と `omit` を同時指定 |
