---
sidebar_position: 2
slug: /reference/relation/include
---

# include

`findMany` / `findFirst` でリレーション先のデータを一緒に取得したい場合に利用します。

使用するには事前に[リレーション定義](/docs/reference/relation/definition)が必要です。

## 説明例用のシート

[リレーション定義](/docs/reference/relation/definition)のシート例を使用します。

## 基本的な使い方

`include` にリレーション名を指定し、値に `true` を渡すと、リレーション先のデータが全て取得されます。

```ts
const result = gassma.sheets.Users.findMany({
  include: {
    posts: true,
  },
});
```

戻り値は以下の形式です。

```ts
[
  {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    posts: [
      { id: 1, title: "初めての投稿", authorId: 1, published: true },
      { id: 2, title: "GASの使い方", authorId: 1, published: true },
    ],
  },
  {
    id: 2,
    name: "Bob",
    email: "bob@example.com",
    posts: [
      { id: 3, title: "下書き記事", authorId: 2, published: false },
    ],
  },
  {
    id: 3,
    name: "Charlie",
    email: "charlie@example.com",
    posts: [],
  },
];
```

リレーションの種類によって返される形が異なります。

| リレーション種類 | 返される形 |
| --- | --- |
| oneToMany | 配列 |
| manyToMany | 配列 |
| oneToOne | 単一オブジェクト or `null` |
| manyToOne | 単一オブジェクト or `null` |

### manyToOne の例

```ts
const result = gassma.sheets.Posts.findMany({
  include: {
    author: true,
  },
});
```

戻り値は以下の形式です。

```ts
[
  {
    id: 1,
    title: "初めての投稿",
    authorId: 1,
    published: true,
    author: { id: 1, name: "Alice", email: "alice@example.com" },
  },
  {
    id: 3,
    title: "下書き記事",
    authorId: 2,
    published: false,
    author: { id: 2, name: "Bob", email: "bob@example.com" },
  },
  // ...
];
```

## include のオプション

`true` の代わりにオブジェクトを渡すことで、リレーション先のデータに条件を付けることができます。

### 使用できるキー

| キー名 | 内容 | 省略 |
| --- | --- | --- |
| where | リレーション先の取得条件 | 可 |
| orderBy | リレーション先のソート | 可 |
| skip | リレーション先のスキップ数 | 可 |
| take | リレーション先の取得数 | 可 |
| select | リレーション先の取得列の表示設定 | 可 |
| omit | リレーション先の取得列の除外設定 | 可 |
| include | さらに深いリレーションの取得 | 可 |

### where

リレーション先のデータに条件を付けて取得できます。

```ts
const result = gassma.sheets.Users.findMany({
  include: {
    posts: {
      where: { published: true },
    },
  },
});
```

戻り値は以下の形式です。

```ts
[
  {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    posts: [
      { id: 1, title: "初めての投稿", authorId: 1, published: true },
      { id: 2, title: "GASの使い方", authorId: 1, published: true },
    ],
  },
  {
    id: 2,
    name: "Bob",
    email: "bob@example.com",
    posts: [],  // published: false の記事はフィルタされる
  },
  // ...
];
```

### orderBy

リレーション先のデータをソートできます。

```ts
const result = gassma.sheets.Users.findMany({
  include: {
    posts: {
      orderBy: { title: "desc" },
    },
  },
});
```

### skip / take

リレーション先のデータをページネーションできます。`skip` と `take` を組み合わせて使用します。

```ts
const result = gassma.sheets.Users.findMany({
  include: {
    posts: {
      orderBy: { id: "asc" },
      skip: 1,
      take: 1,
    },
  },
});
```

上記の例では、各ユーザーの投稿を id 昇順で並べ、最初の 1 件をスキップし、次の 1 件だけを取得します。

:::note
`skip` / `take` は oneToMany と manyToMany で利用できます。oneToOne / manyToOne は単一レコードのため対象外です。
:::

### select

リレーション先のデータの取得列を指定できます。

```ts
const result = gassma.sheets.Users.findMany({
  include: {
    posts: {
      select: { title: true },
    },
  },
});
```

戻り値は以下の形式です。

```ts
[
  {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    posts: [
      { title: "初めての投稿" },
      { title: "GASの使い方" },
    ],
  },
  // ...
];
```

### omit

リレーション先のデータの特定列を除外できます。

```ts
const result = gassma.sheets.Users.findMany({
  include: {
    posts: {
      omit: { authorId: true },
    },
  },
});
```

:::caution
`select` と `omit` は同時に指定できません。
:::

### ネストされた include

`include` の中にさらに `include` を指定することで、深い階層のリレーションを取得できます。

例えば、Users → Posts → Tags のようなリレーションを一度に取得できます。

```ts
const gassma = new Gassma.GassmaClient({
  relations: {
    Users: {
      posts: {
        type: "oneToMany",
        to: "Posts",
        field: "id",
        reference: "authorId",
      },
    },
    Posts: {
      tags: {
        type: "manyToMany",
        to: "Tags",
        field: "id",
        reference: "id",
        through: {
          sheet: "PostTags",
          field: "postId",
          reference: "tagId",
        },
      },
    },
  },
});

const result = gassma.sheets.Users.findMany({
  include: {
    posts: {
      include: {
        tags: true,
      },
    },
  },
});
```

戻り値は以下の形式です。

```ts
[
  {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    posts: [
      {
        id: 1,
        title: "初めての投稿",
        authorId: 1,
        published: true,
        tags: [
          { id: 1, name: "GAS" },
          { id: 2, name: "JavaScript" },
        ],
      },
      {
        id: 2,
        title: "GASの使い方",
        authorId: 1,
        published: true,
        tags: [
          { id: 1, name: "GAS" },
        ],
      },
    ],
  },
  // ...
];
```

:::caution
`select` と `include` は同時に指定できません。
:::

## _count

リレーション先のレコード件数を取得できます。

### 全リレーションのカウント

`_count: true` を指定すると、定義されている全リレーションのレコード件数を取得します。

```ts
const result = gassma.sheets.Users.findMany({
  include: {
    _count: true,
  },
});
```

戻り値は以下の形式です。

```ts
[
  {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    _count: { posts: 2, profile: 1 },
  },
  {
    id: 2,
    name: "Bob",
    email: "bob@example.com",
    _count: { posts: 1, profile: 0 },
  },
  // ...
];
```

### 特定リレーションのカウント

`_count: { select: { ... } }` でカウントするリレーションを指定できます。

```ts
const result = gassma.sheets.Users.findMany({
  include: {
    _count: {
      select: { posts: true },
    },
  },
});
```

### where フィルタ付きカウント

カウント対象に条件を付けることもできます。

```ts
const result = gassma.sheets.Users.findMany({
  include: {
    _count: {
      select: {
        posts: {
          where: { published: true },
        },
      },
    },
  },
});
```

戻り値は以下の形式です。

```ts
[
  {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    _count: { posts: 2 },  // published: true の投稿のみカウント
  },
  // ...
];
```

### select と _count の組み合わせ

トップレベルの `select` と `_count` を組み合わせることもできます。

```ts
const result = gassma.sheets.Users.findMany({
  select: {
    name: true,
    _count: {
      select: { posts: true },
    },
  },
});
```

戻り値は以下の形式です。

```ts
[
  { name: "Alice", _count: { posts: 2 } },
  { name: "Bob", _count: { posts: 1 } },
  // ...
];
```

:::note
`_count` は全てのリレーション種別（oneToMany / oneToOne / manyToOne / manyToMany）に対応しています。
:::

## 複数リレーションの同時取得

1 回のクエリで複数のリレーションを同時に取得できます。

```ts
const result = gassma.sheets.Users.findMany({
  include: {
    posts: true,
    profile: true,
  },
});
```

## include と select の制限

**トップレベル**の `select` と `include` は同時に使用できません。

```ts
// これはエラーになります
gassma.sheets.Users.findMany({
  select: { name: true },
  include: { posts: true },
});
```

## バリデーション

| エラー | 原因 |
| --- | --- |
| `IncludeWithoutRelationsError` | リレーション定義なしで `include` を使用 |
| `GassmaIncludeSelectConflictError` | トップレベルで `include` と `select` を同時使用 |
| `IncludeSelectOmitConflictError` | include 内で `select` と `omit` を同時指定 |
| `IncludeSelectIncludeConflictError` | include 内で `select` と `include` を同時指定 |
| `IncludeInvalidOptionTypeError` | include の値やオプションの型が不正 |
| `GassmaRelationNotFoundError` | 指定したリレーション名が定義されていない |
