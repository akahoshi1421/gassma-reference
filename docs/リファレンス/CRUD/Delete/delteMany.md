---
sidebar_position: 1
slug: /reference/crud/delete/deleteMany
---

# deleteMany()

特定の条件に合致した全ての行を削除したい場合に利用します。

## 使用できるキー

| キー名 | 内容                       | 省略 | 備考                                     |
| ------ | -------------------------- | ---- | ---------------------------------------- |
| where  | 削除条件の指定             | 可   | 書かない場合は全ての行が対象になります   |
| limit  | 削除する最大件数           | 可   | 負数を指定するとエラーになります         |

## 説明例用のシート

![説明用シート](../../img/exampleSheet.png)

## 説明

上記例から以下の処理を行いたいとします。

- age => **20 の行を削除**

この場合以下のコードとなります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.deleteMany
const result = gassma.sheets.sheet1.deleteMany({
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
const result = gassma.sheets.sheet1.deleteMany({
  where: {
    pref: "Tokyo",
  },
  limit: 3,
});
```

`limit: 0` を指定すると 0 件削除（何も削除しない）となります。

:::caution
`limit` に負数を指定すると `GassmaLimitNegativeError` がスローされます。
:::

また`where`の仕様は[findMany()の記事](../read/findMany)に準拠します。
