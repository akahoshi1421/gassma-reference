---
sidebar_position: 1
slug: /reference/statistics/aggregate
description: "_avg、_sum、_min、_max、_count などの集計を行う"
---

# aggregate()

平均や最大値等の統計を行いたい場合に利用します。

## 使用できるキー

| キー名  | 内容               | 省略 | 備考                                          |
| ------- | ------------------ | ---- | --------------------------------------------- |
| where   | 取得条件の指定           | 可   | 書かない場合は全ての行を取得します            |
| orderBy | ソート設定               | 可   | 指定する列が 1 つの場合、配列の省略が可能です |
| take    | 取得数の設定             | 可   |
| skip    | スキップ数の設定         | 可   |
| cursor  | カーソルベースページネーション | 可   | 詳細は [findMany の cursor](/docs/reference/crud/read/findMany#cursor) を参照 |
| \_avg   | 平均表示の設定     | 可   | 数値の列のみ指定できます。詳細は [集計キーが指定できる列](#集計キーが指定できる列) を参照 |
| \_count | ヒット数表示の設定 | 可   | すべての列を指定できます。`_all` や `true` 省略形も指定可能です。詳細は [\_count](#_count) を参照 |
| \_max   | 最大値表示の設定   | 可   | 数値 / 文字列 / 真偽値 / 日付の列を指定できます。詳細は [集計キーが指定できる列](#集計キーが指定できる列) を参照 |
| \_min   | 最小値表示の設定   | 可   | 数値 / 文字列 / 真偽値 / 日付の列を指定できます。詳細は [集計キーが指定できる列](#集計キーが指定できる列) を参照 |
| \_sum   | 合計表示の設定     | 可   | 数値の列のみ指定できます。詳細は [集計キーが指定できる列](#集計キーが指定できる列) を参照 |

:::tip
`where` では[リレーションフィルタ](/docs/reference/relation/where-relation-filter)（`some` / `every` / `none` / `is` / `isNot`）も利用可能です。
:::

## 説明例用のシート

![説明用シート](../img/exampleSheet.png)

## 説明

上記例から以下の処理を行いたいとします。

- age => **平均を求める**
- age => **最大値を求める**
- age => **最低値を求める**

この場合以下のコードとなります。

```ts
// gassma.{{TARGET_SHEET_NAME}}.aggregate
const result = gassma.sheet1.aggregate({
  _avg: {
    age: true,
  },
  _max: {
    age: true,
  },
  _min: {
    age: true,
  },
});
```

戻り値は以下の形式です。

```ts
{
  _avg: { age: 33.333333333333336 },
  _max: { age: 55 },
  _min: { age: 20 }
}
```

:::note
`_avg` / `_sum` / `_max` / `_min` では、null に加えて `NaN` / 不正な Date（Invalid Date）も欠損値として集計から除外されます。集計対象の値がすべて欠損値の場合、結果は null になります。
:::

## 集計キーが指定できる列

集計キーごとに、指定できる列の型が異なります。

| 集計キー | 指定できる列の型 |
| --- | --- |
| \_avg | 数値 |
| \_sum | 数値 |
| \_max | 数値 / 文字列 / 真偽値 / 日付 |
| \_min | 数値 / 文字列 / 真偽値 / 日付 |
| \_count | すべての列（行数を数えるだけのため型を問いません） |

CLI を使う場合、`_avg` / `_sum` に指定できるのは TypeScript 型が `number` になる列（`Int` / `Float` / `Decimal` / `BigInt`）だけで、それ以外の列を書くと型エラーになります。`_max` / `_min` / `_count` はすべての列を指定できます（[型マッピング](/docs/reference/schema#型マッピング)を参照）。

`_max` / `_min` の結果は列の型ごとに次のようになります。

- 数値: 最大 / 最小の数値
- 文字列: 辞書順で最大 / 最小の文字列
- 日付: 最も新しい / 最も古い日付
- 真偽値: 最大は 1 つでも `true` があれば `true`、最小はすべて `true` のときだけ `true`

:::caution
型のチェックは実行時にシートの値に対して行われます。GAS エディタだけで使う場合や、シートに宣言と違う型の値が入っている場合は、以下のエラーがスローされます。

- `_avg` / `_sum` に数値以外の列を指定した場合: `GassmaAggregateAvgTypeError` / `GassmaAggregateSumTypeError`
- `_max` / `_min` に上記 4 つ以外の型の列を指定した場合: `GassmaAggregateTypeError`
- 1 つの列に複数の型の値が混ざっている場合: `GassmaAggregateAvgError` / `GassmaAggregateSumError` / `GassmaAggregateMaxError` / `GassmaAggregateMinError`

詳細は[エラー一覧](/docs/reference/errors)を参照してください。
:::

### リレーションは跨げません

集計キーに指定できるのは**自分のモデルの列だけ**です。リレーション先の列は指定できません（Prisma と同じ挙動です）。`groupBy` の `by` も同様です。

リレーション先の値を集計したい場合は、[include](/docs/reference/relation/include) で取得してコード側で集計してください。

```ts
const users = gassma.Users.findMany({
  include: {
    posts: true,
  },
});

const totalPosts = users.reduce((sum, user) => sum + user.posts.length, 0);
```

:::tip
`where` では[リレーションフィルタ](/docs/reference/relation/where-relation-filter)が使えるため、「リレーション先の条件で行を絞ってから自分の列を集計する」ことはできます。
:::

## _count

ヒット数を求めたい場合に利用します。

### 列を指定したカウント

`_count` に列名を指定すると、その列の値が null（空のセル）や `NaN` / 不正な Date（Invalid Date）などの欠損値ではない行のみを数えます。

```ts
// gassma.{{TARGET_SHEET_NAME}}.aggregate
const result = gassma.sheet1.aggregate({
  _count: {
    age: true,
  },
});
```

戻り値は以下の形式です。

```ts
{
  _count: { age: 9 }
}
```

### _all を使った全行数のカウント

`_all: true` を指定すると、null を含む全ての行数を数えます。

```ts
// gassma.{{TARGET_SHEET_NAME}}.aggregate
const result = gassma.sheet1.aggregate({
  _count: {
    _all: true,
    postNumber: true,
  },
});
```

戻り値は以下の形式です。

```ts
{
  _count: { _all: 9, postNumber: 9 }
}
```

列を指定したカウントは null の行を数えないため、例えば postNumber が空の行が 2 行あるシートでは `{ _all: 9, postNumber: 7 }` のように結果が異なります。

### true 省略形

`_count: true` を指定すると、全行数が数値としてそのまま返されます。

```ts
// gassma.{{TARGET_SHEET_NAME}}.aggregate
const result = gassma.sheet1.aggregate({
  _count: true,
});
```

戻り値は以下の形式です。

```ts
{
  _count: 9
}
```

:::note
`_all` と `true` 省略形は `_count` 専用で、`_avg` / `_max` / `_min` / `_sum` では利用できません。`_count` は行数を数えるため null を含む全行に意味がありますが、他の集計は特定の列の値を対象とするためです。
:::
