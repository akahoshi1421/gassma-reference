---
sidebar_position: 5
slug: /reference/relation/nested-write
---

# Nested Write（create）

`create` メソッド内でリレーション先のレコードを同時に作成・関連付けしたい場合に利用します。

使用するには事前に[リレーション定義](/docs/reference/relation/definition)が必要です。

## 説明例用のシート

[リレーション定義](/docs/reference/relation/definition)のシート例を使用します。

## 使用できる操作

| 操作 | 内容 |
| --- | --- |
| create | リレーション先のレコードを新規作成して関連付け |
| createMany | リレーション先のレコードを複数新規作成して関連付け |
| connect | 既存のリレーション先レコードを関連付け |
| connectOrCreate | 既存のレコードがあれば関連付け、なければ新規作成して関連付け |

### リレーション種類ごとの対応表

| 操作 | manyToOne | oneToOne | oneToMany | manyToMany |
| --- | --- | --- | --- | --- |
| create | 単一のみ | 単一のみ | 単一/配列 | 単一/配列 |
| createMany | - | - | 対応 | - |
| connect | 対応 | 対応 | 単一/配列 | 単一/配列 |
| connectOrCreate | 対応 | 対応 | 単一/配列 | 単一/配列 |

## create

### manyToOne での create

ユーザーを作成しながら、そのユーザーに紐づく投稿も同時に作成する例です。ただし manyToOne は逆方向（投稿側から著者を作成）として使います。

```ts
const result = gassma.sheets.Posts.create({
  data: {
    id: 4,
    title: "新しい記事",
    published: true,
    author: {
      create: {
        id: 4,
        name: "Dave",
        email: "dave@example.com",
      },
    },
  },
});
```

上記を実行すると以下が行われます。

1. Users シートに Dave が作成される
2. Dave の `id`（= 4）が Posts の `authorId` に自動セットされる
3. Posts シートに新しい記事が作成される

戻り値は以下の形式です。

```ts
{
  id: 4,
  title: "新しい記事",
  authorId: 4,
  published: true,
}
```

### oneToMany での create

ユーザー作成と同時に投稿も作成します。

```ts
const result = gassma.sheets.Users.create({
  data: {
    id: 4,
    name: "Dave",
    email: "dave@example.com",
    posts: {
      create: [
        { id: 4, title: "Dave の記事1", published: true },
        { id: 5, title: "Dave の記事2", published: false },
      ],
    },
  },
});
```

上記を実行すると以下が行われます。

1. Users シートに Dave が作成される
2. Posts シートに 2 件の記事が作成される（`authorId` は Dave の `id` = 4 が自動セット）

配列ではなく単一オブジェクトで 1 件だけ作成することもできます。

```ts
posts: {
  create: { id: 4, title: "Dave の記事", published: true },
}
```

### manyToMany での create

投稿作成と同時にタグも作成し、中間テーブルに関連付けます。

```ts
const result = gassma.sheets.Posts.create({
  data: {
    id: 4,
    title: "新しい記事",
    authorId: 1,
    published: true,
    tags: {
      create: { id: 3, name: "TypeScript" },
    },
  },
});
```

上記を実行すると以下が行われます。

1. Posts シートに新しい記事が作成される
2. Tags シートに "TypeScript" タグが作成される
3. PostTags シートに `{ postId: 4, tagId: 3 }` が作成される

## createMany

oneToMany で複数の子レコードを一括作成します。

```ts
const result = gassma.sheets.Users.create({
  data: {
    id: 4,
    name: "Dave",
    email: "dave@example.com",
    posts: {
      createMany: {
        data: [
          { id: 4, title: "記事1", published: true },
          { id: 5, title: "記事2", published: false },
        ],
      },
    },
  },
});
```

各レコードの `authorId` には Dave の `id` が自動セットされます。

## connect

既存のレコードを関連付けます。`where` 条件で対象レコードを指定します。

### manyToOne での connect

既存のユーザーと紐づけて投稿を作成します。

```ts
const result = gassma.sheets.Posts.create({
  data: {
    id: 4,
    title: "新しい記事",
    published: true,
    author: {
      connect: { name: "Alice" },
    },
  },
});
```

上記を実行すると以下が行われます。

1. Users シートから `name: "Alice"` のレコードを検索
2. 見つかった Alice の `id`（= 1）が Posts の `authorId` に自動セットされる
3. Posts シートに新しい記事が作成される

:::caution
条件に一致するレコードが見つからない場合、`NestedWriteConnectNotFoundError` がスローされます。
:::

### oneToMany での connect

ユーザー作成と同時に、既存の投稿を紐づけます。

```ts
const result = gassma.sheets.Users.create({
  data: {
    id: 4,
    name: "Dave",
    email: "dave@example.com",
    posts: {
      connect: [
        { title: "下書き記事" },
      ],
    },
  },
});
```

上記を実行すると、Posts シートの「下書き記事」の `authorId` が Dave の `id`（= 4）に更新されます。

### manyToMany での connect

既存のタグと投稿を関連付けます。

```ts
const result = gassma.sheets.Posts.create({
  data: {
    id: 4,
    title: "新しい記事",
    authorId: 1,
    published: true,
    tags: {
      connect: [
        { name: "GAS" },
        { name: "JavaScript" },
      ],
    },
  },
});
```

上記を実行すると以下が行われます。

1. Posts シートに新しい記事が作成される
2. PostTags シートに `{ postId: 4, tagId: 1 }` と `{ postId: 4, tagId: 2 }` が作成される

Tags シートのレコード自体は変更されません。

## connectOrCreate

既存のレコードがあれば関連付け、なければ新規作成して関連付けます。

```ts
const result = gassma.sheets.Posts.create({
  data: {
    id: 4,
    title: "新しい記事",
    published: true,
    author: {
      connectOrCreate: {
        where: { name: "Alice" },
        create: {
          id: 4,
          name: "Alice",
          email: "alice-new@example.com",
        },
      },
    },
  },
});
```

上記の場合、Users シートに Alice が存在するため connect と同じ動作になります。存在しない場合は `create` のデータで新規作成されます。

oneToMany / manyToMany では配列で複数指定できます。

```ts
tags: {
  connectOrCreate: [
    {
      where: { name: "GAS" },
      create: { id: 3, name: "GAS" },
    },
    {
      where: { name: "新しいタグ" },
      create: { id: 4, name: "新しいタグ" },
    },
  ],
}
```

## 深いネスト

Nested write は再帰的に処理されるため、深い階層のリレーションも一度に作成できます。

例えば、ユーザー → 投稿 → タグ を一度に作成する場合：

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

const result = gassma.sheets.Users.create({
  data: {
    id: 4,
    name: "Dave",
    email: "dave@example.com",
    posts: {
      create: {
        id: 4,
        title: "Dave の記事",
        published: true,
        tags: {
          create: { id: 3, name: "TypeScript" },
        },
      },
    },
  },
});
```

上記を実行すると以下の順序で処理が行われます。

1. Users シートに Dave が作成される
2. Posts シートに記事が作成される（`authorId: 4` が自動セット）
3. Tags シートに "TypeScript" が作成される
4. PostTags シートに関連行が作成される

## 注意事項

- Nested write は `create` メソッドのみで利用できます。`createMany` / `updateMany` 等では利用できません。
- FK は自動セットされますが、PK（id 等）は明示的に指定する必要があります。オートインクリメント機能はありません。
- `connect` で指定した `where` 条件に一致するレコードが見つからない場合、`NestedWriteConnectNotFoundError` がスローされます。

## バリデーション

| エラー | 原因 |
| --- | --- |
| `NestedWriteWithoutRelationsError` | リレーション定義なしで nested write 構文を使用 |
| `NestedWriteConnectNotFoundError` | `connect` / `connectOrCreate` の where でレコードが見つからない |
