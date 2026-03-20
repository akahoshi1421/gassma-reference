---
sidebar_position: 1
slug: /reference/crud/create/create
---

# create()

該当シートに新しい 1 行を追加したい場合に利用します。

## 使用できるキー

| キー名  | 内容                       | 省略 | 備考                                             |
| ------- | -------------------------- | ---- | ------------------------------------------------ |
| data    | 登録するデータの指定       | 不可 |                                                  |
| select  | 戻り値の取得列の表示設定   | 可   | `omit` / `include` と同時に使用できません        |
| omit    | 戻り値の取得列の除外設定   | 可   | `select` と同時に使用できません                  |
| include | リレーション先の取得       | 可   | [詳細はこちら](/docs/reference/relation/include) |

## 説明例用のシート

![説明用シート](../../img/exampleSheet.png)

## 説明

上記例に以下の行を追加したいとします。

- name => **Shibata**
- age => **23**
- pref => **Shimane**
- postNumber => **690-8540**

この場合以下のコードとなります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.create
const result = gassma.sheets.sheet1.create({
  data: {
    name: "Shibata",
    age: 23,
    pref: "Shimane",
    postNumber: "690-8540",
  },
});
```

戻り値は以下の形式です。

```ts
{
  name: 'Shibata',
  age: 23,
  pref: 'Shimane',
  postNumber: '690-8540'
}
```

作成された行のデータが返されます。

また、以下のように年齢を省くとその行の`age`列部分が空になります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.create
gassma.sheets.sheet1.create({
  data: {
    name: "Shibata",
    pref: "Shimane",
    postNumber: "690-8540",
  },
});
```

戻り値は以下の形式です。

```ts
{
  name: 'Shibata',
  age: null,
  pref: 'Shimane',
  postNumber: '690-8540'
}
```

## Nested Write

リレーション定義がある場合、`data` の中にリレーション先のレコードを同時に作成・関連付けする操作を記述できます。

詳しくは [Nested Write のリファレンス](/docs/reference/relation/nested-write)を参照してください。
