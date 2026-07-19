---
sidebar_position: 2
slug: /reference/crud/read/findFirst
---

# findFirst()

特定の条件に合致した最初の行を取り出したい場合に利用します。

## 使用できるキー

| キー名   | 内容             | 省略 | 備考                                          |
| -------- | ---------------- | ---- | --------------------------------------------- |
| where    | 取得条件の指定       | 可   | 書かない場合は全ての行を取得します            |
| select   | 取得列の表示設定     | 可   | `omit` / `include` と同時に使用できません。リレーションフィールドにオプション指定可 |
| omit     | 取得列の除外設定     | 可   | `select` と同時に使用できません               |
| include  | リレーション先の取得 | 可   | [詳細はこちら](/docs/reference/relation/include) |
| orderBy  | ソート設定           | 可   | 指定する列が 1 つの場合、配列の省略が可能です |
| take     | 取得数の設定         | 可   | `1` または `-1` のみ指定可能。詳細は下記      |
| skip     | スキップ数の設定     | 可   | 負数はエラー                                  |
| distinct | 重複削除の設定       | 可   | 指定する列が 1 つの場合、配列の省略が可能です |
| cursor   | カーソルベースページネーション | 可 | 詳細は [findMany の cursor](/docs/reference/crud/read/findMany#cursor) を参照 |

## 説明例用のシート

![説明用シート](../../img/exampleSheet.png)

## 説明

上記例から以下の条件の行を取り出したいとします。

- age => **20 以上**

この場合以下のコードとなります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.findFirst
const result = gassma.sheet1.findFirst({
  where: {
    age: {
      gte: 20,
    },
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

## take

`findFirst` の `take` には **`1` または `-1` のみ**指定できます。それ以外の値を指定すると `GassmaFindFirstTakeError` がスローされます。

- `1`: 並び順のまま先頭の 1 件を取得します（省略時と同じ挙動）。
- `-1`: 並びを反転してから先頭の 1 件、つまり末尾側の 1 件を取得します。

```ts
// age の昇順に並べた末尾（最大 age）の 1 件を取得
const result = gassma.sheet1.findFirst({
  orderBy: { age: "asc" },
  take: -1,
});
```

:::caution
`1` / `-1` 以外を指定すると `GassmaFindFirstTakeError` がスローされます。`findMany` の `take` とは異なり、件数の指定はできません。
:::

## skip

先頭から `skip` 件を飛ばした最初の 1 件を取得します。スキップした結果レコードが残らない場合は `null` が返されます。

```ts
// 条件に合致した行のうち、先頭 2 件を飛ばした次の 1 件を取得
const result = gassma.sheet1.findFirst({
  where: { age: { gte: 20 } },
  skip: 2,
});
```

:::caution
`skip` に負数を指定すると `GassmaSkipNegativeError` がスローされます。
:::

## distinct

指定した列の値が重複する行を除外した上で、最初の 1 件を取得します。使い方は [findMany の distinct](./findMany#distinct) と同じです。

## 処理順序

`findFirst` は以下の順序で処理され、最終的に先頭の 1 件（該当がなければ `null`）を返します。

1. `where` - フィルター
2. `orderBy` - ソート
3. `take` - `-1` の場合は並びを反転
4. `cursor` - カーソル位置で切り出し（カーソル自身を含む）
5. `distinct` - 重複削除
6. `skip` - 指定件数をスキップ
7. 先頭の 1 件を取得
8. `select` / `omit` - フィールド整形

また、key のオプション等それ以外の仕様については[findMany()](./findMany)に準拠します。
