---
sidebar_position: 1
---

# updateMany()

特定の条件に合致した全ての行を指定した値に更新します。

## 使用できるキー

| キー名 | 内容             | 省略 | 備考                                   |
| ------ | ---------------- | ---- | -------------------------------------- |
| where  | 取得条件の指定   | 可   | 書かない場合は全ての行が対象になります |
| data   | 取得列の表示設定 | 不可 |

## 説明例用のシート

![説明用シート](../../img/exampleSheet.png)

## 説明

上記例から以下の処理を行いたいとします。

- age => **20 を 21 にする**

この場合以下のコードとなります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.updateMany
const result = gassma.sheets.sheet1.updateMany({
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

また`where`の仕様は[findMany()の記事](../Read/findMany)の記事に準拠します。
