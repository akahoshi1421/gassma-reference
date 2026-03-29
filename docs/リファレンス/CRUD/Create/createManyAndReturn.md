---
sidebar_position: 3
slug: /reference/crud/create/createManyAndReturn
---

# createManyAndReturn()

該当シートに複数行を同時に追加し、作成された全レコードを配列で取得したい場合に利用します。

`createMany` と同じ書き込み処理を行いますが、戻り値が異なります。

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

- 1 行目

  - name => **Shibata**
  - age => **23**
  - pref => **Shimane**
  - postNumber => **690-8540**

- 2 行目
  - name => **Suzuhara**
  - age => **25**
  - pref => **Tottori**
  - postNumber => **680-8571**

この場合以下のコードとなります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.createManyAndReturn
const result = gassma.sheet1.createManyAndReturn({
  data: [
    {
      name: "Shibata",
      age: 23,
      pref: "Shimane",
      postNumber: "690-8540",
    },
    {
      name: "Suzuhara",
      age: 25,
      pref: "Tottori",
      postNumber: "680-8571",
    },
  ],
});
```

戻り値は以下の形式です。

```ts
[
  { name: "Shibata", age: 23, pref: "Shimane", postNumber: "690-8540" },
  { name: "Suzuhara", age: 25, pref: "Tottori", postNumber: "680-8571" },
];
```

作成された全レコードが配列で返されます。

## createMany との違い

| メソッド | 戻り値 |
| --- | --- |
| `createMany` | `{ count: number }` |
| `createManyAndReturn` | 作成されたレコードの配列 |

また、空配列を渡した場合の挙動も異なります。

```ts
// createMany の場合
gassma.sheet1.createMany({ data: [] });
// => undefined

// createManyAndReturn の場合
gassma.sheet1.createManyAndReturn({ data: [] });
// => []
```

data に指定しなかったフィールドは `null` として返されます。

```ts
const result = gassma.sheet1.createManyAndReturn({
  data: [{ name: "Shibata" }],
});
// => [{ name: "Shibata", age: null, pref: null, postNumber: null }]
```

:::note
`createManyAndReturn` では [Nested Write](/docs/reference/relation/nested-write) は利用できません。リレーション先を同時に操作したい場合は `create` を使用してください。
:::
