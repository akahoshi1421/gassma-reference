---
sidebar_position: 6
slug: /reference/fields
---

# fields（列同士の比較）

`where` 条件内で、固定値ではなく**同じ行の別の列の値**と比較したい場合に `fields` プロパティを利用します。

## 基本的な使い方

各シートコントローラーの `fields` プロパティから `FieldRef` を取得し、フィルタ条件の値として渡します。

```ts
const gassma = new Gassma.GassmaClient();
const userSheet = gassma.sheets.Users;

// firstName と lastName が同じ値のユーザーを検索
const result = userSheet.findMany({
  where: {
    firstName: { equals: userSheet.fields.lastName },
  },
});
```

上記の例では、各行ごとに `firstName` と `lastName` の値を比較し、一致する行のみを返します。

## 使用できる演算子

`FieldRef` は以下の演算子で使用できます。

| 演算子 | 動作 | 例 |
| --- | --- | --- |
| equals | 同値か | `{ equals: sheet.fields.otherColumn }` |
| lt | 未満 | `{ lt: sheet.fields.maxValue }` |
| lte | 以下 | `{ lte: sheet.fields.maxValue }` |
| gt | 超過 | `{ gt: sheet.fields.minValue }` |
| gte | 以上 | `{ gte: sheet.fields.minValue }` |
| contains | 文字列を含むか | `{ contains: sheet.fields.keyword }` |
| startsWith | 文字列で始まるか | `{ startsWith: sheet.fields.prefix }` |
| endsWith | 文字列で終わるか | `{ endsWith: sheet.fields.suffix }` |

:::caution
`not`、`in`、`notIn` では `FieldRef` は使用できません。
:::

## 数値の比較

```ts
// age が maxAge より小さいユーザーを検索
const result = userSheet.findMany({
  where: {
    age: { lt: userSheet.fields.maxAge },
  },
});
```

## 文字列の比較

```ts
// fullName に firstName の値を含むレコードを検索
const result = userSheet.findMany({
  where: {
    fullName: { contains: userSheet.fields.firstName },
  },
});
```

## mode: "insensitive" との組み合わせ

`FieldRef` は `mode: "insensitive"` と組み合わせて大文字小文字を区別しない比較ができます。

```ts
const result = userSheet.findMany({
  where: {
    firstName: {
      equals: userSheet.fields.lastName,
      mode: "insensitive",
    },
  },
});
```

## AND / OR / NOT での使用

論理演算子の中でも `FieldRef` を使用できます。

```ts
const result = userSheet.findMany({
  where: {
    OR: [
      { firstName: { equals: userSheet.fields.lastName } },
      { age: { gt: userSheet.fields.minAge } },
    ],
  },
});
```

## 使用できるメソッド

`fields` は `where` を使用するすべてのメソッドで利用可能です。

- `findMany` / `findFirst` / `findFirstOrThrow`
- `update` / `updateMany` / `updateManyAndReturn`
- `delete` / `deleteMany`
- `upsert`
- `count` / `aggregate` / `groupBy`

## 参照先の列が存在しない場合

`FieldRef` で指定した列名がシートに存在しない場合、その条件はマッチしません（エラーにはなりません）。
