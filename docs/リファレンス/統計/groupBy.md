---
sidebar_position: 3
---

# groupBy()

データをグループ化したい場合に利用します。

## 使用できるキー

| キー名  | 内容                           | 省略 | 備考                                          |
| ------- | ------------------------------ | ---- | --------------------------------------------- |
| where   | 取得条件の指定                 | 可   | 書かない場合は全ての行を取得します            |
| orderBy | ソート設定                     | 可   | 指定する列が 1 つの場合、配列の省略が可能です |
| take    | 取得数の設定                   | 可   |
| skip    | スキップ数の設定               | 可   |
| \_avg   | 平均表示の設定                 | 可   |
| \_count | ヒット数表示の設定             | 可   |
| \_max   | 最大値表示の設定               | 可   |
| \_min   | 最小値表示の設定               | 可   |
| \_sum   | 合計表示の設定                 | 可   |
| by      | グループ化条件の指定           | 不可 |
| having  | グループ化した後の取得条件指定 | 可   | 書かない場合は全てのデータを取得します        |

## 説明例用のシート

![説明用シート](../img/exampleSheet.png)

## 説明

上記例から以下の処理を行いたいとします。

- pref でグループ化

この場合以下のコードとなります。

```ts
// gassma.sheets.{{TARGET_SHEET_NAME}}.groupBy
const result = gassma.sheets.sheet1.groupBy({
  by: "pref",
});
```

戻り値は以下の形式です。

```ts
[
  { pref: "Ibaraki" },
  { pref: "Tokyo" },
  { pref: "Osaka" },
  { pref: "Aichi" },
  { pref: "Shiga" },
  { pref: "Kyoto" },
  { pref: "Tottori" },
  { pref: "Fukuoka" },
];
```

また、複数指定することもでき、以下の処理を行いたいとします。

- pref でグループ化
- さらに age でグループ化

この場合以下のコードとなります。

```ts
// gassma.sheets.{{TARGET_SHEET_NAME}}.groupBy
const result = gassma.sheets.sheet1.groupBy({
  by: ["pref", "age"],
});
```

戻り値は以下の形式です。

```ts
[
  { pref: "Ibaraki", age: 22 },
  { pref: "Tokyo", age: 31 },
  { pref: "Tokyo", age: 55 },
  { pref: "Osaka", age: 20 },
  { pref: "Aichi", age: 40 },
  { pref: "Shiga", age: 25 },
  { pref: "Kyoto", age: 45 },
  { pref: "Tottori", age: 29 },
  { pref: "Fukuoka", age: 33 },
];
```

### having

グループ化されたデータの中で、特定の条件を満たすデータを抽出したい場合に利用します。

例えば以下の条件でデータを抽出したいとします。

- pref でグループ化
- (グループ化した後)age => **平均が 30 以下**

この場合以下のコードとなります。

```ts
// gassma.sheets.{{TARGET_SHEET_NAME}}.groupBy
const result = gassma.sheets.sheet1.groupBy({
  by: ["pref"],
  having: {
    age: {
      _avg: {
        lte: 30,
      },
    },
  },
});
```

戻り値は以下の形式です。

```ts
[
  { pref: "Ibaraki" },
  { pref: "Osaka" },
  { pref: "Shiga" },
  { pref: "Tottori" },
];
```

### having の AND, OR, NOT

AND, OR, NOT を利用することも可能です。

例えば以下の処理を行いたいとします。

- pref でグループ化
- (グループ化した後)age => **平均が 30 以下ではない**

この場合以下のコードとなります。

```ts
// gassma.sheets.{{TARGET_SHEET_NAME}}.groupBy
const result = gassma.sheets.sheet1.groupBy({
  by: ["pref"],
  having: {
    NOT: {
      age: {
        _avg: {
          lte: 30,
        },
      },
    },
  },
});
```

戻り値は以下のようになります。

```ts
[{ pref: "Tokyo" }, { pref: "Aichi" }, { pref: "Kyoto" }, { pref: "Fukuoka" }];
```

また、`where`と同様 NOT の下に AND を入れたりネストすることが可能です。

### 統計の表示

aggregate のように平均などを表示することもできます。

例えば以下の処理を行いたいとします。

- pref でグループ化
- age の平均を表示

この場合以下のコードとなります。

```ts
// gassma.sheets.{{TARGET_SHEET_NAME}}.groupBy
const result = gassma.sheets.sheet1.groupBy({
  by: ["pref"],
  _avg: { age: true },
});
```

戻り値は以下の形式です。

```ts
[
  { pref: "Ibaraki", _avg: { age: 22 } },
  { pref: "Tokyo", _avg: { age: 43 } },
  { pref: "Osaka", _avg: { age: 20 } },
  { pref: "Aichi", _avg: { age: 40 } },
  { pref: "Shiga", _avg: { age: 25 } },
  { pref: "Kyoto", _avg: { age: 45 } },
  { pref: "Tottori", _avg: { age: 29 } },
  { pref: "Fukuoka", _avg: { age: 33 } },
];
```
