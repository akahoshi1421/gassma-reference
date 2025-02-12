---
sidebar_position: 3
---

# groupBy()

データをグループ化したい場合に利用します。

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
