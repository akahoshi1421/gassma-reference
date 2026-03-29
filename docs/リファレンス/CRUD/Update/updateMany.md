---
sidebar_position: 1
slug: /reference/crud/update/updateMany
---

# updateMany()

特定の条件に合致した全ての行を指定した値に更新します。

## 使用できるキー

| キー名 | 内容                       | 省略 | 備考                                     |
| ------ | -------------------------- | ---- | ---------------------------------------- |
| where  | 更新条件の指定             | 可   | 書かない場合は全ての行が対象になります   |
| data   | 更新するデータ             | 不可 |                                          |
| limit  | 更新する最大件数           | 可   | 負数を指定するとエラーになります         |

## 説明例用のシート

![説明用シート](../../img/exampleSheet.png)

## 説明

上記例から以下の処理を行いたいとします。

- age => **20 を 21 にする**

この場合以下のコードとなります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.updateMany
const result = gassma.sheet1.updateMany({
  where: {
    age: 20,
  },
  data: {
    age: 21,
  },
});
```

戻り値は以下の形式です。

```ts
{
  count: 1;
}
```

更新された行の数が返されます。

また`where`の仕様は[findMany()の記事](../read/findMany)に準拠します。

## limit

更新する最大件数を指定できます。

```ts
// 最大 2 件のみ更新
const result = gassma.sheet1.updateMany({
  where: {
    pref: "Tokyo",
  },
  data: {
    age: 99,
  },
  limit: 2,
});
```

`limit: 0` を指定すると 0 件更新（何も更新しない）となります。

:::caution
`limit` に負数を指定すると `GassmaLimitNegativeError` がスローされます。
:::

## 数値の原子的操作

`data` に `increment` / `decrement` / `multiply` / `divide` を指定すると、現在値に対して演算を行えます。

```ts
// 全員の age を 1 加算する
const result = gassma.sheet1.updateMany({
  data: {
    age: { increment: 1 },
  },
});
```

| 操作 | 動作 | 例 |
| --- | --- | --- |
| increment | 加算 | `{ increment: 5 }` → 現在値 + 5 |
| decrement | 減算 | `{ decrement: 3 }` → 現在値 - 3 |
| multiply | 乗算 | `{ multiply: 2 }` → 現在値 × 2 |
| divide | 除算 | `{ divide: 4 }` → 現在値 ÷ 4 |

現在値が数値でない場合は `0` をベースとして演算されます。詳しくは [update()](/docs/reference/crud/update/update) を参照してください。
