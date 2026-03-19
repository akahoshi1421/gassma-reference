---
sidebar_position: 3
slug: /reference/crud/update/updateManyAndReturn
---

# updateManyAndReturn()

特定の条件に合致した全ての行を指定した値に更新し、更新後のレコードを配列で取得したい場合に利用します。

`updateMany` と同じ更新処理を行いますが、戻り値が異なります。

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

- pref が **Tokyo** の行の age を **99** にする

この場合以下のコードとなります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.updateManyAndReturn
const result = gassma.sheets.sheet1.updateManyAndReturn({
  where: {
    pref: "Tokyo",
  },
  data: {
    age: 99,
  },
});
```

戻り値は以下の形式です。

```ts
[
  { name: "sato", age: 99, pref: "Tokyo", postNumber: "160-0023" },
  { name: "endo", age: 99, pref: "Tokyo", postNumber: "160-0023" },
];
```

更新後の全レコードが配列で返されます。更新していないフィールドは元の値がそのまま保持されます。

## updateMany との違い

| メソッド | 戻り値 |
| --- | --- |
| `updateMany` | `{ count: number }` |
| `updateManyAndReturn` | 更新後のレコードの配列 |

条件に合致するレコードがない場合は空配列が返されます。

```ts
const result = gassma.sheets.sheet1.updateManyAndReturn({
  where: { name: "存在しない名前" },
  data: { age: 99 },
});
// => []
```

`where` を省略すると全行が更新対象となり、全レコードが返されます。

```ts
const result = gassma.sheets.sheet1.updateManyAndReturn({
  data: { age: 99 },
});
// => 全レコードが age: 99 で返される
```

また`where`の仕様は[findMany()の記事](../read/findMany)に準拠します。

## limit

更新する最大件数を指定できます。詳しくは [updateMany()](/docs/reference/crud/update/updateMany) を参照してください。

## 数値の原子的操作

`data` に `increment` / `decrement` / `multiply` / `divide` を指定できます。詳しくは [update()](/docs/reference/crud/update/update) を参照してください。
