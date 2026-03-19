---
sidebar_position: 2
slug: /reference/statistics/count
---

# count()

ヒット数を求めたい場合に利用します。

## 使用できるキー

| キー名  | 内容             | 省略 | 備考                                          |
| ------- | ---------------- | ---- | --------------------------------------------- |
| where   | 取得条件の指定           | 可   | 書かない場合は全ての行を取得します            |
| orderBy | ソート設定               | 可   | 指定する列が 1 つの場合、配列の省略が可能です |
| take    | 取得数の設定             | 可   |
| skip    | スキップ数の設定         | 可   |
| cursor  | カーソルベースページネーション | 可   | 詳細は [findMany の cursor](/docs/reference/crud/read/findMany#cursor) を参照 |

:::tip
`where` では[リレーションフィルタ](/docs/reference/relation/where-relation-filter)（`some` / `every` / `none` / `is` / `isNot`）も利用可能です。
:::

## 説明例用のシート

![説明用シート](../img/exampleSheet.png)

## 説明

上記例から以下の処理を行いたいとします。

- age => **20 以上**

この場合以下のコードとなります。

```ts
// gassma.sheets.{{TARGET_SHEET_NAME}}.count
const result = gassma.sheets.sheet1.count({
  where: {
    age: {
      gte: 20,
    },
  },
});
```

戻り値は以下の形式です。

```
9
```
