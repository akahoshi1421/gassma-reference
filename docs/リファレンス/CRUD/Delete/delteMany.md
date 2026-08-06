---
sidebar_position: 1
slug: /reference/crud/delete/deleteMany
description: "条件に合致するすべてのレコードを削除し、削除件数を取得する。limit に対応"
---

# deleteMany()

特定の条件に合致した全ての行を削除したい場合に利用します。

## 使用できるキー

| キー名 | 内容                       | 省略 | 備考                                     |
| ------ | -------------------------- | ---- | ---------------------------------------- |
| where  | 削除条件の指定             | 可   | 書かない場合は全ての行が対象になります   |
| limit  | 削除する最大件数           | 可   | 負数を指定するとエラーになります         |

:::caution
`where: {}` や、条件が `undefined` / `Gassma.skip` だけで空になった場合も**全行が削除対象**になります。意図しない `undefined` を検出したい場合は [strictUndefinedChecks](/docs/reference/config/strict-undefined-checks) を有効にしてください。
:::

## 説明例用のシート

![説明用シート](../../img/exampleSheet.png)

## 説明

上記例から以下の処理を行いたいとします。

- age => **20 の行を削除**

この場合以下のコードとなります。

```ts
const gassma = new GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.deleteMany
const result = gassma.sheet1.deleteMany({
  where: {
    age: 20,
  },
});
```

戻り値は以下の形式です。

```ts
{
  count: 1;
}
```

削除された行の数が返されます。

## limit

削除する最大件数を指定できます。

```ts
// 最大 3 件のみ削除
const result = gassma.sheet1.deleteMany({
  where: {
    pref: "Tokyo",
  },
  limit: 3,
});
```

`limit: 0` を指定すると 0 件削除（何も削除しない）となります。

:::caution
`limit` に有限の負数を指定すると `GassmaLimitNegativeError` がスローされます。

`NaN` / `Infinity` / `-Infinity` / `null` を指定した場合は `GassmaInvalidValueError` です。この場合、行は 1 件も削除されません。

```ts
gassma.sheet1.deleteMany({ limit: NaN });
// => Invalid value for argument `limit`. Expected a finite number, but received NaN.

gassma.sheet1.deleteMany({ limit: null });
// => Invalid value for argument `limit`. Expected a number, but received null.
```

`limit: -Infinity` は、有限かどうかの判定が先に行われるため `GassmaLimitNegativeError` ではなく `GassmaInvalidValueError` になります。`undefined` は無視されます（上限なし）。
:::

また`where`の仕様は[findMany()の記事](../read/findMany)に準拠します。
