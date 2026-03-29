---
sidebar_position: 0
slug: /reference/crud/delete/delete
---

# delete()

特定の条件に合致した**最初の 1 行**を削除し、削除されたレコードを取得します。条件に合致するレコードがない場合は `null` を返します。

## 使用できるキー

| キー名  | 内容                   | 省略 | 備考                                      |
| ------- | ---------------------- | ---- | ----------------------------------------- |
| where   | 削除条件の指定         | 不可 |                                           |
| select  | 戻り値の取得列の表示設定 | 可 | `include` と同時に使用できません          |
| omit    | 戻り値の取得列の除外設定 | 可 | `select` と同時に使用できません          |
| include | リレーション先の取得   | 可   | [詳細はこちら](/docs/reference/relation/include) |

## 説明例用のシート

![説明用シート](../../img/exampleSheet.png)

## 説明

上記例から以下の処理を行いたいとします。

- name が **akahoshi** の行を削除

この場合以下のコードとなります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.delete
const result = gassma.sheet1.delete({
  where: {
    name: "akahoshi",
  },
});
```

戻り値は以下の形式です。

```ts
{
  name: 'akahoshi',
  age: 22,
  pref: 'Ibaraki',
  postNumber: '310-8555'
}
```

削除されたレコードが返されます。

条件に合致するレコードがない場合は `null` が返されます。

```ts
const result = gassma.sheet1.delete({
  where: { name: "存在しない名前" },
});
// => null
```

複数のレコードが条件に合致する場合でも、**最初の 1 件のみ**が削除されます。

## select / omit

戻り値のフィールドを制御できます。

```ts
const result = gassma.sheet1.delete({
  where: { name: "akahoshi" },
  select: { name: true, age: true },
});
// => { name: "akahoshi", age: 22 }
```

## onDelete

リレーション定義で `onDelete` が設定されている場合、`delete` でも referential action が実行されます。

詳しくは [onDelete のリファレンス](/docs/reference/relation/on-delete)を参照してください。

また`where`の仕様は[findMany()の記事](../read/findMany)に準拠します。
