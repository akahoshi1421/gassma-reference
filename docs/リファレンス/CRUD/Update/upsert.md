---
sidebar_position: 4
slug: /reference/crud/update/upsert
---

# upsert()

特定の条件に合致したレコードが存在すれば更新し、存在しなければ新規作成します。結果のレコードを返します。

## 使用できるキー

| キー名  | 内容                     | 省略 | 備考                                      |
| ------- | ------------------------ | ---- | ----------------------------------------- |
| where   | 検索条件の指定           | 不可 |                                           |
| create  | 未存在時の作成データ     | 不可 |                                           |
| update  | 存在時の更新データ       | 不可 |                                           |
| select  | 戻り値の取得列の表示設定 | 可   | `include` と同時に使用できません          |
| omit    | 戻り値の取得列の除外設定 | 可   | `select` と同時に使用できません          |
| include | リレーション先の取得     | 可   | [詳細はこちら](/docs/reference/relation/include) |

## 説明例用のシート

![説明用シート](../../img/exampleSheet.png)

## 説明

上記例から以下の処理を行いたいとします。

- name が **akahoshi** の age を **23** にする
- 存在しなければ新規作成する

この場合以下のコードとなります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.upsert
const result = gassma.sheets.sheet1.upsert({
  where: {
    name: "akahoshi",
  },
  update: {
    age: 23,
  },
  create: {
    name: "akahoshi",
    age: 23,
    pref: "Ibaraki",
    postNumber: "310-8555",
  },
});
```

レコードが存在する場合、更新後のレコードが返されます。

```ts
{
  name: 'akahoshi',
  age: 23,
  pref: 'Ibaraki',
  postNumber: '310-8555'
}
```

レコードが存在しない場合、`create` データで新規作成され、作成されたレコードが返されます。

```ts
const result = gassma.sheets.sheet1.upsert({
  where: { name: "newuser" },
  update: { age: 30 },
  create: {
    name: "newuser",
    age: 30,
    pref: "Tokyo",
    postNumber: "100-0001",
  },
});
// => { name: "newuser", age: 30, pref: "Tokyo", postNumber: "100-0001" }
```

## Nested Write

リレーション定義がある場合、`create` / `update` 内で Nested Write が利用できます。

- `create` 時: [create の Nested Write](/docs/reference/relation/nested-write) と同等
- `update` 時: [update の Nested Write](/docs/reference/relation/nested-write-update) と同等

また`where`の仕様は[findMany()の記事](../read/findMany)に準拠します。
