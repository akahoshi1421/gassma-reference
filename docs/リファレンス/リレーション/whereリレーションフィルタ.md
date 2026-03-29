---
sidebar_position: 3
slug: /reference/relation/where-relation-filter
---

# where リレーションフィルタ

`where` 条件の中でリレーション先のデータを基準にフィルタリングしたい場合に利用します。

使用するには事前に[リレーション定義](/docs/reference/relation/definition)が必要です。

## 説明例用のシート

[リレーション定義](/docs/reference/relation/definition)のシート例を使用します。

## 対応するメソッド

where リレーションフィルタは以下の全メソッドで利用できます。

- `findMany` / `findFirst`
- `update` / `updateMany` / `deleteMany`
- `aggregate` / `count` / `groupBy`

## フィルタの種類

リレーションの種類によって使用できるフィルタが異なります。

| フィルタ | oneToMany | manyToMany | oneToOne | manyToOne |
| --- | --- | --- | --- | --- |
| some | 使用可 | 使用可 | - | - |
| every | 使用可 | 使用可 | - | - |
| none | 使用可 | 使用可 | - | - |
| is | - | - | 使用可 | 使用可 |
| isNot | - | - | 使用可 | 使用可 |

## リストリレーションのフィルタ（oneToMany / manyToMany）

### some

関連レコードの中に**少なくとも 1 つ**条件に一致するものがあるレコードを取得します。

例：公開済みの投稿を 1 件以上持つユーザーを取得

```ts
const result = gassma.Users.findMany({
  where: {
    posts: {
      some: { published: true },
    },
  },
});
```

戻り値は以下の形式です。

```ts
[
  { id: 1, name: "Alice", email: "alice@example.com" },
];
```

Alice は公開済みの投稿を持っているため取得されます。Bob は `published: false` の投稿のみ、Charlie は投稿なしのため除外されます。

### every

関連レコードの**全て**が条件に一致するレコードを取得します。関連レコードが 0 件の場合も一致扱いになります。

例：全ての投稿が公開済みのユーザーを取得

```ts
const result = gassma.Users.findMany({
  where: {
    posts: {
      every: { published: true },
    },
  },
});
```

戻り値は以下の形式です。

```ts
[
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 3, name: "Charlie", email: "charlie@example.com" },
];
```

Alice は全投稿が `published: true`、Charlie は投稿が 0 件（=全てが条件を満たす）のため取得されます。

### none

関連レコードの中に条件に一致するものが**1 つもない**レコードを取得します。

例：公開済みの投稿を 1 件も持たないユーザーを取得

```ts
const result = gassma.Users.findMany({
  where: {
    posts: {
      none: { published: true },
    },
  },
});
```

戻り値は以下の形式です。

```ts
[
  { id: 2, name: "Bob", email: "bob@example.com" },
  { id: 3, name: "Charlie", email: "charlie@example.com" },
];
```

## 単一リレーションのフィルタ（oneToOne / manyToOne）

### is

関連レコードが条件に一致するレコードを取得します。`null` を指定すると、関連レコードが存在しないレコードを取得できます。

例：著者名が "Alice" の投稿を取得

```ts
const result = gassma.Posts.findMany({
  where: {
    author: {
      is: { name: "Alice" },
    },
  },
});
```

戻り値は以下の形式です。

```ts
[
  { id: 1, title: "初めての投稿", authorId: 1, published: true },
  { id: 2, title: "GASの使い方", authorId: 1, published: true },
];
```

### is: null

関連レコードが存在しない（FK が null の）レコードを取得できます。

```ts
const result = gassma.Posts.findMany({
  where: {
    author: {
      is: null,
    },
  },
});
```

### isNot

関連レコードが条件に一致**しない**レコードを取得します。`null` を指定すると、関連レコードが存在するレコードを取得できます。

例：著者名が "Alice" ではない投稿を取得

```ts
const result = gassma.Posts.findMany({
  where: {
    author: {
      isNot: { name: "Alice" },
    },
  },
});
```

戻り値は以下の形式です。

```ts
[
  { id: 3, title: "下書き記事", authorId: 2, published: false },
];
```

### isNot: null

FK が null でないレコード（=関連先が存在するレコード）を取得できます。

```ts
const result = gassma.Posts.findMany({
  where: {
    author: {
      isNot: null,
    },
  },
});
```

## AND / OR / NOT との組み合わせ

リレーションフィルタは AND / OR / NOT と自由に組み合わせることができます。

### OR との組み合わせ

例：公開済みの投稿を持つユーザー、または名前が "Charlie" のユーザーを取得

```ts
const result = gassma.Users.findMany({
  where: {
    OR: [
      { posts: { some: { published: true } } },
      { name: "Charlie" },
    ],
  },
});
```

### NOT との組み合わせ

例：下書き記事を持たないユーザーを取得

```ts
const result = gassma.Users.findMany({
  where: {
    NOT: {
      posts: { some: { published: false } },
    },
  },
});
```

## findMany / findFirst 以外での使用例

### updateMany

公開済み投稿を持つユーザーのメールアドレスを更新

```ts
gassma.Users.updateMany({
  where: {
    posts: { some: { published: true } },
  },
  data: {
    email: "updated@example.com",
  },
});
```

### count

公開済み投稿を持つユーザー数をカウント

```ts
const count = gassma.Users.count({
  where: {
    posts: { some: { published: true } },
  },
});
```

## バリデーション

| エラー | 原因 |
| --- | --- |
| `WhereRelationWithoutContextError` | リレーション定義なしでリレーションフィルタ構文を使用 |
| `WhereRelationInvalidFilterError` | リストフィルタ (some/every/none) を oneToOne/manyToOne に使用、または単一フィルタ (is/isNot) を oneToMany/manyToMany に使用 |
