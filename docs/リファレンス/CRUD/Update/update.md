---
sidebar_position: 0
slug: /reference/crud/update/update
---

# update()

特定の条件に合致した**最初の 1 行**を指定した値に更新し、更新後のレコードを取得します。条件に合致するレコードがない場合は `null` を返します。

## 使用できるキー

| キー名 | 内容                   | 省略 | 備考                                   |
| ------ | ---------------------- | ---- | -------------------------------------- |
| where  | 取得条件の指定         | 可   | 書かない場合は最初の行が対象になります |
| data   | 更新するデータ         | 不可 |                                        |
| select | 戻り値の取得列の表示設定 | 可 | `omit` と同時に使用できません          |
| omit   | 戻り値の取得列の除外設定 | 可 | `select` と同時に使用できません        |

## 説明例用のシート

![説明用シート](../../img/exampleSheet.png)

## 説明

上記例から以下の処理を行いたいとします。

- name が **akahoshi** の行の age を **23** にする

この場合以下のコードとなります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.update
const result = gassma.sheets.sheet1.update({
  where: {
    name: "akahoshi",
  },
  data: {
    age: 23,
  },
});
```

戻り値は以下の形式です。

```ts
{
  name: 'akahoshi',
  age: 23,
  pref: 'Ibaraki',
  postNumber: '310-8555'
}
```

更新後のレコードが返されます。更新していないフィールドは元の値がそのまま保持されます。

条件に合致するレコードがない場合は `null` が返されます。

```ts
const result = gassma.sheets.sheet1.update({
  where: { name: "存在しない名前" },
  data: { age: 99 },
});
// => null
```

また`where`の仕様は[findMany()の記事](../read/findMany)に準拠します。

## 数値の原子的操作

`data` に `increment` / `decrement` / `multiply` / `divide` を指定すると、現在値に対して演算を行えます。

```ts
// age を 1 加算する
const result = gassma.sheets.sheet1.update({
  where: { name: "akahoshi" },
  data: {
    age: { increment: 1 },
  },
});
// age: 22 → 23
```

| 操作 | 動作 | 例 |
| --- | --- | --- |
| increment | 加算 | `{ increment: 5 }` → 現在値 + 5 |
| decrement | 減算 | `{ decrement: 3 }` → 現在値 - 3 |
| multiply | 乗算 | `{ multiply: 2 }` → 現在値 × 2 |
| divide | 除算 | `{ divide: 4 }` → 現在値 ÷ 4 |

現在値が数値でない場合は `0` をベースとして演算されます。

通常の値指定と組み合わせることもできます。

```ts
const result = gassma.sheets.sheet1.update({
  where: { name: "akahoshi" },
  data: {
    age: { increment: 1 },
    pref: "Tokyo",
  },
});
```

## Nested Write

リレーション定義がある場合、`data` の中にリレーション先のレコードを同時に操作する記述ができます。

`create` の Nested Write に加えて、`update` / `delete` / `deleteMany` / `disconnect` / `set` 操作が利用できます。

詳しくは [Nested Write（update）のリファレンス](/docs/reference/relation/nested-write-update)を参照してください。
