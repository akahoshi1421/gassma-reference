---
sidebar_position: 1
---

# findMany()

特定の条件に合致したすべての行を取り出したい場合に利用します。

## 使用できるキー

| キー名   | 内容             | 省略 | 備考                                          |
| -------- | ---------------- | ---- | --------------------------------------------- |
| where    | 取得条件の指定   | 可   | 書かない場合は全ての行を取得します            |
| select   | 取得列の表示設定 | 可   |
| orderBy  | ソート設定       | 可   | 指定する列が 1 つの場合、配列の省略が可能です |
| take     | 取得数の設定     | 可   |
| skip     | スキップ数の設定 | 可   |
| distinct | 重複削除の設定   | 可   | 指定する列が 1 つの場合、配列の省略が可能です |

## 説明例用のシート

![説明用シート](../../img/exampleSheet.png)

## 説明

上記例から以下の条件の行を取り出したいとします。

- pref => **Tokyo**

この場合以下のコードとなります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheets.sheet1.findMany({
  where: {
    pref: "Tokyo",
  },
});
```

戻り値は以下の形式です。

```ts
[
  { name: "sato", age: 31, pref: "Tokyo", postNumber: "160-0023" },
  { name: "endo", age: 55, pref: "Tokyo", postNumber: "160-0023" },
];
```

複数の条件を指定したい場合は以下のコードとなります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheets.sheet1.findMany({
  where: {
    pref: "Tokyo",
    年齢: 31,
  },
});
```

## 演算子・部分一致

以上・以下や部分一致等の条件付き検索も可能です。例えば以下の条件で行を取り出したいとします。

- age => **20 以上**
- age => **30 以下**

この場合以下のコードとなります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheets.sheet1.findMany({
  where: {
    age: {
      gte: 20,
      lte: 30,
    },
  },
});
```

条件付き検索に関連するキーは以下の通りです。

| キー名     | 役割                                           | 例                  |
| ---------- | ---------------------------------------------- | ------------------- |
| equals     | 同値か                                         | eauals: 20          |
| not        | 同値ではないか                                 | not: 20             |
| in         | 指定したリストの中にあるか                     | in: [20, 21, 22]    |
| notIn      | 指定したリストの中にないか                     | notIn: [23, 24. 25] |
| lt         | 未満                                           | lt: 30              |
| lte        | 以下                                           | lte: 30             |
| gt         | 超過                                           | gt: 20              |
| gte        | 以上                                           | gte: 20             |
| contains   | 対象データの中に指定した文字列が含まれているか | contains: "AB"      |
| startsWith | 対象データが指定した文字列から始まっているか   | startsWith: "AB"    |
| endsWith   | 対象データが指定した文字列で終わっているか     | endsWith: "YZ"      |

## AND, OR, NOT

複数条件での検索も可能です。

### AND

例えば以下の条件で行を取り出したいとします。

- age => **22**
- pref => **Ibaraki**

AND を利用して検索する場合以下のようになります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheets.sheet1.findMany({
  where: {
    AND: [
      {
        age: 22,
      },
      {
        pref: "Ibaraki",
      },
    ],
  },
});
```

### OR

例えば以下の条件で行を取り出したいとします。

- age => **22 または 40**

OR を利用して検索する場合以下のようになります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheets.sheet1.findMany({
  where: {
    OR: [
      {
        age: 22,
      },
      {
        age: 40,
      },
    ],
  },
});
```

### NOT

例えば以下の条件で行を取り出したいとします。

- age => **22 ではない**
- age => **40 ではない**

NOT を利用して検索する場合以下のようになります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheets.sheet1.findMany({
  where: {
    NOT: [
      {
        age: 22,
      },
      {
        age: 40,
      },
    ],
  },
});
```

### AND, OR, NOT の重ねがけ

例えば AND の下に OR や NOT を入れることができます。この入れ子構造は GAS のコールスタックが許す限り無限に可能です。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheets.sheet1.findMany({
  where: {
    NOT: {
      AND: [
        {
          name: "akahoshi",
        },
        {
          age: 22,
        },
      ],
    },
  },
});
```

## select

戻り値に返るデータを制限することができます。

例えば`age`と`pref`のみ取得したい場合は以下のようになります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheets.sheet1.findMany({
  where: {
    age: {
      gte: 20,
    },
  },
  select: {
    name: true,
    pref: true,
  },
});
```

戻り値は以下のようになります。

```ts
[
  { name: "akahoshi", pref: "Ibaraki" },
  { name: "sato", pref: "Tokyo" },
  { name: "suzuki", pref: "Osaka" },
  { name: "yamamoto", pref: "Aichi" },
  { name: "ono", pref: "Shiga" },
  { name: "kudo", pref: "Kyoto" },
  { name: "kondo", pref: "Tottori" },
  { name: "endo", pref: "Tokyo" },
  { name: "murakami", pref: "Fukuoka" },
];
```

## orderBy

取得した行をソートすることができます。

例えば`age`で昇順でソートする場合は以下のようになります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheets.sheet1.findMany({
  where: {
    age: {
      gte: 20,
    },
  },
  orderBy: {
    age: "asc",
  },
});
```

指定できるデータは以下の通りです。

| キー名 | 意味 |
| ------ | ---- |
| asc    | 昇順 |
| desc   | 降順 |

また、複数ソートの条件を指定することもでき、例えば

- `age`で昇順でソート
- `age`の値が同じ行があればその部分は`name`の昇順でソート

といったことを行いたい場合コードは以下のようになります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheets.sheet1.findMany({
  where: {
    age: {
      gte: 20,
    },
  },
  orderBy: [{ age: "asc" }, { name: "asc" }],
});
```

※ソートの優先順位はインデックス番号の若い順となります。

## take

取得数を指定できます。取得数はシートの上の行から順となります。

例えば条件に合致した行の中から上から 2 行を取得したい場合以下のようになります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheets.sheet1.findMany({
  where: {
    age: {
      gte: 20,
    },
  },
  take: 2,
});
```

## skip

取得した行の中から特定行をスキップできます。

例えば条件に合致した行の中から上 1 つ目を省きたい場合、コードは以下のようになります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheets.sheet1.findMany({
  where: {
    age: {
      gte: 20,
    },
  },
  skip: 1,
});
```

## distinct

列名を指定し、もし値が被っている場合その行を省略できます。被っている場合は上の行のデータが優先されます。

例えば`age`の被りを省略する場合、コードは以下のようになります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheets.sheet1.findMany({
  where: {
    age: {
      gte: 20,
    },
  },
  distinct: ["age"],
});
```
