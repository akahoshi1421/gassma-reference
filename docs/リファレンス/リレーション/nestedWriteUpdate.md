---
sidebar_position: 6
slug: /reference/relation/nested-write-update
description: "update の中で update/delete/deleteMany/disconnect/set を使って関連レコードを変更する"
---

# Nested Write（update）

`update` メソッドの `data` 内でリレーション先のレコードを同時に操作できます。

[create の Nested Write](/docs/reference/relation/nested-write) で使える操作に加えて、`update` / `delete` / `deleteMany` / `disconnect` / `set` 操作が利用できます。

## 説明例用のシート

[リレーション定義](/docs/reference/relation/definition)のシート例を使用します。

## 使用できる操作

| 操作 | manyToOne / oneToOne | oneToMany | manyToMany |
| --- | --- | --- | --- |
| create | 単一のみ | 単一 / 配列 | 単一 / 配列 |
| createMany | - | 対応 | - |
| connect | 対応 | 単一 / 配列 | 単一 / 配列 |
| connectOrCreate | 対応 | 単一 / 配列 | 単一 / 配列 |
| update | 対応 | 単一 / 配列 | - |
| delete | 対応 | 単一 / 配列 | - |
| deleteMany | - | 単一 / 配列 | - |
| disconnect | 対応 | 単一 / 配列 | 単一 / 配列 |
| set | - | 対応 | 対応 |

:::note
manyToOne と oneToOne は使える操作の形は同じですが、動作が異なります。manyToOne（FK 保有側）は**自レコードの FK** を操作し、oneToOne（非FK側）は **FK を保有するリレーション先レコード**を操作します（[リレーション定義](/docs/reference/relation/definition)を参照）。
:::

### oneToOne（非FK側）の挙動

| 操作 | 動作 | 対象レコードが存在しない場合 |
| --- | --- | --- |
| create | リレーション先レコードを FK 自動セットで作成 | - |
| connect | 置き換え（既接続レコードの FK を null 化してから、対象レコードの FK を親にセット） | `NestedWriteConnectNotFoundError` |
| connectOrCreate | 存在すれば connect と同じ置き換え、なければ FK 自動セットで作成 | - |
| update | リレーション先レコードを更新（data を直接指定） | `NestedWriteTargetNotFoundError` |
| disconnect: true | リレーション先レコードの FK を null 化 | 何もしない |
| delete: true | リレーション先レコードを削除 | `NestedWriteTargetNotFoundError` |

`set` / `deleteMany` / `createMany` / 配列形式の指定は `NestedWriteInvalidOperationError` になります。

## create

リレーション先のレコードを新規作成して関連付けます。[create の Nested Write](/docs/reference/relation/nested-write) と同じ動作です。

```ts
// oneToMany: ユーザー更新時に新しい投稿を作成
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      create: { id: 4, title: "新しい投稿", published: true },
    },
  },
});
```

## connect

既存のリレーション先レコードを関連付けます。

```ts
// manyToOne: 投稿の著者を既存ユーザーに変更
gassma.Posts.update({
  where: { id: 1 },
  data: {
    author: {
      connect: { name: "Bob" },
    },
  },
});
```

oneToOne（非FK側）では**置き換え**として動作します。すでに接続されているリレーション先レコードの FK を `null` にしてから、対象レコードの FK を親にセットします。

```ts
// oneToOne: ユーザーのプロフィールを別のプロフィールに置き換え
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    profile: {
      connect: { id: 2 },
    },
  },
});
// => Profiles の id: 1（既接続）の userId が null になった後、
//    id: 2 の userId が Alice の id（= 1）に更新される
```

## connectOrCreate

既存のレコードがあれば関連付け、なければ新規作成して関連付けます。

```ts
// manyToOne: 著者が存在すれば接続、なければ作成
gassma.Posts.update({
  where: { id: 1 },
  data: {
    author: {
      connectOrCreate: {
        where: { name: "Dave" },
        create: { id: 4, name: "Dave", email: "dave@example.com" },
      },
    },
  },
});
```

## update

関連するレコードを更新します。

### manyToOne（FK 保有側）

更新データを直接指定します。自レコードの FK が参照しているレコードが更新されます。

```ts
// manyToOne: 投稿の著者名を更新
gassma.Posts.update({
  where: { id: 1 },
  data: {
    author: {
      update: { name: "Alice Updated" },
    },
  },
});
```

### oneToOne（非FK側）

同じく更新データを直接指定します。親を参照しているリレーション先レコードが更新されます。

```ts
// oneToOne: ユーザーのプロフィールを更新
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    profile: {
      update: { bio: "更新後の自己紹介" },
    },
  },
});
```

:::caution
接続されているリレーション先レコードが存在しない場合、`NestedWriteTargetNotFoundError` がスローされます。
:::

### oneToMany

`where` と `data` を指定して更新対象を絞り込みます。配列で複数指定も可能です。

```ts
// oneToMany: 特定の投稿を更新
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      update: {
        where: { id: 1 },
        data: { title: "更新後のタイトル" },
      },
    },
  },
});

// 複数の投稿を同時に更新
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      update: [
        { where: { id: 1 }, data: { title: "タイトルA" } },
        { where: { id: 2 }, data: { title: "タイトルB" } },
      ],
    },
  },
});
```

## delete

関連するレコードを削除します。

### manyToOne（FK 保有側）

`delete: true` を指定すると、関連先のレコードを削除し、自身の FK を `null` に設定します。

```ts
// manyToOne: 投稿の著者を削除（投稿の authorId は null になる）
gassma.Posts.update({
  where: { id: 1 },
  data: {
    author: { delete: true },
  },
});
```

### oneToOne（非FK側）

`delete: true` を指定すると、親を参照しているリレーション先レコードを削除します。自レコードは変更されません。

```ts
// oneToOne: ユーザーのプロフィールを削除
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    profile: { delete: true },
  },
});
// => Profiles の userId: 1 のレコードが削除される
```

:::caution
接続されているリレーション先レコードが存在しない場合、`NestedWriteTargetNotFoundError` がスローされます。
:::

### oneToMany

`where` 条件を指定して削除対象を絞り込みます。配列で複数指定も可能です。

```ts
// oneToMany: 特定の投稿を削除
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      delete: { id: 3 },
    },
  },
});

// 複数削除
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      delete: [{ id: 2 }, { id: 3 }],
    },
  },
});
```

## deleteMany

条件に合致する関連レコードを一括削除します。oneToMany でのみ使用できます。

```ts
// oneToMany: 未公開の投稿を全て削除
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      deleteMany: { published: false },
    },
  },
});

// 複数条件で削除
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      deleteMany: [
        { published: false },
        { title: "下書き" },
      ],
    },
  },
});
```

## disconnect

リレーションの関連付けを解除します。レコード自体は削除されません。

### manyToOne（FK 保有側）

`disconnect: true` を指定すると、自身の FK を `null` に設定します。

```ts
// manyToOne: 投稿と著者の関連付けを解除
gassma.Posts.update({
  where: { id: 1 },
  data: {
    author: { disconnect: true },
  },
});
// => Posts の authorId が null になる
```

### oneToOne（非FK側）

`disconnect: true` を指定すると、親を参照しているリレーション先レコードの FK を `null` に設定します。

```ts
// oneToOne: ユーザーとプロフィールの関連付けを解除
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    profile: { disconnect: true },
  },
});
// => Profiles の userId: 1 が null になる
```

接続されているレコードが存在しない場合は何も行われません（エラーになりません）。

### oneToMany

`where` 条件を指定して、関連レコードの FK を `null` に設定します。

```ts
// oneToMany: 特定の投稿の関連付けを解除
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      disconnect: { id: 1 },
    },
  },
});
// => Posts の id: 1 の authorId が null になる

// 複数の関連付けを解除
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      disconnect: [{ id: 1 }, { id: 2 }],
    },
  },
});
```

### manyToMany

中間テーブルのレコードを削除します。

```ts
// manyToMany: タグの関連付けを解除
gassma.Posts.update({
  where: { id: 1 },
  data: {
    tags: {
      disconnect: { id: 3 },
    },
  },
});
// => PostTags テーブルから対応するレコードが削除される
```

## set

リレーションの関連付けを全て入れ替えます。oneToMany と manyToMany でのみ使用できます。

### oneToMany

全ての子レコードの FK を `null` に設定した後、指定したレコードの FK を親に設定します。

```ts
// oneToMany: Alice の投稿を id: 1 と id: 2 のみに置換
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      set: [{ id: 1 }, { id: 2 }],
    },
  },
});
// => 既存の全投稿の authorId が null になった後、
//    id: 1 と id: 2 の authorId が Alice の id に設定される
```

### manyToMany

中間テーブルのレコードを全削除した後、指定したレコードとの関連を新規作成します。

```ts
// manyToMany: 投稿のタグを完全に入れ替え
gassma.Posts.update({
  where: { id: 1 },
  data: {
    tags: {
      set: [{ id: 10 }, { id: 11 }],
    },
  },
});
// => PostTags から投稿 id: 1 の全レコードが削除された後、
//    新しい関連レコードが作成される
```

## 複数操作の組み合わせ

1 つの update 内で複数のリレーション操作を組み合わせることも可能です。

```ts
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    name: "Alice Updated",
    posts: {
      create: { id: 5, title: "新記事", published: true },
      update: { where: { id: 1 }, data: { title: "更新済み" } },
      delete: { id: 3 },
    },
  },
});
```

## エラー

| エラー | 原因 |
| --- | --- |
| `NestedWriteWithoutRelationsError` | リレーション定義なしで Nested Write を実行した |
| `NestedWriteInvalidOperationError` | リレーション種別に対応しない操作を指定した |
| `NestedWriteConnectNotFoundError` | connect / connectOrCreate で対象レコードが見つからなかった |
| `NestedWriteTargetNotFoundError` | 非FK側 oneToOne の update / delete でリレーション先レコードが存在しなかった |
