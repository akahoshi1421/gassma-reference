---
sidebar_position: 2
---

# upsertMany()

特定の条件に合致した全ての行を指定した値に更新するが、条件に合致した行がない場合指定したデータを新規に追加したい場合に利用します。

## 使用できるキー

| キー名 | 内容             | 省略 |
| ------ | ---------------- | ---- |
| where  | 取得条件の指定   | 不可 |
| update | 取得列の表示設定 | 不可 |
| create | 取得列の表示設定 | 不可 |

## 説明例用のシート

![説明用シート](../../img/exampleSheet.png)

## 説明

上記例から以下の処理を行いたいとします。

- age => **44 を 45 にする**
- ない場合は以下のデータを追加する
  - name => fukuzawa
  - age => 45
  - pref => yamaguchi
  - postNumber => 753-8650

この場合以下のコードとなります。

```ts
// gassma.sheets.{{TARGET_SHEET_NAME}}.upsertMany
const result = gassma.sheets.sheet1.upsertMany({
  where: {
    age: 44,
  },
  update: {
    age: 45,
  },
  create: {
    name: "fukuzawa",
    age: 45,
    pref: "yamaguchi",
    postNumber: "753-8650",
  },
});
```

戻り値は以下の形式です。

```ts
{
  count: 1;
}
```

追加された行の数が返されます。

また`where`の仕様は[findMany()の記事](../Read/findMany)の記事に準拠します。
