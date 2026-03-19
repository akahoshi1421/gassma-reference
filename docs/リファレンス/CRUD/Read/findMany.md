---
sidebar_position: 1
slug: /reference/crud/read/findMany
---

# findMany()

特定の条件に合致したすべての行を取り出したい場合に利用します。

## 使用できるキー

| キー名   | 内容             | 省略 | 備考                                          |
| -------- | ---------------- | ---- | --------------------------------------------- |
| where    | 取得条件の指定   | 可   | 書かない場合は全ての行を取得します            |
| select   | 取得列の表示設定 | 可   | `omit` / `include` と同時に使用できません     |
| omit     | 取得列の除外設定 | 可   | `select` と同時に使用できません               |
| include  | リレーション先の取得 | 可 | [詳細はこちら](/docs/reference/relation/include) |
| orderBy  | ソート設定       | 可   | 指定する列が 1 つの場合、配列の省略が可能です |
| take     | 取得数の設定     | 可   | 負数で末尾から取得                            |
| skip     | スキップ数の設定 | 可   | 負数はエラー                                  |
| distinct | 重複削除の設定   | 可   | 指定する列が 1 つの場合、配列の省略が可能です |
| cursor   | カーソル位置     | 可   | カーソルベースページネーション                |

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
| mode       | 大文字小文字の区別設定                         | mode: "insensitive" |

各演算子の値には固定値のほか、`fields` プロパティを使って同じ行の別の列の値を指定できます。詳しくは [fields のリファレンス](/docs/reference/fields)を参照してください。

### mode: "insensitive"

`equals`、`not`、`contains`、`startsWith`、`endsWith` に `mode: "insensitive"` を指定すると、大文字小文字を区別せずに比較できます。

```ts
const gassma = new Gassma.GassmaClient();

// "alice"、"Alice"、"ALICE" すべてにマッチ
const result = gassma.sheets.sheet1.findMany({
  where: {
    name: {
      equals: "alice",
      mode: "insensitive",
    },
  },
});
```

`contains`、`startsWith`、`endsWith` でも同様に使用できます。

```ts
// "Hello World"、"HELLO WORLD" などにマッチ
const result = gassma.sheets.sheet1.findMany({
  where: {
    title: {
      contains: "hello",
      mode: "insensitive",
    },
  },
});
```

`mode` を指定しない場合、またはデフォルトの `mode: "default"` の場合は大文字小文字が区別されます。

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

### where でのリレーションフィルタ

リレーション定義がある場合、`where` 内でリレーション先の条件を使ってフィルタリングできます（`some`、`every`、`none`、`is`、`isNot`）。

詳しくは [where リレーションフィルタのリファレンス](/docs/reference/relation/where-relation-filter)を参照してください。

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

### null 値の並び順制御

オブジェクト形式で `nulls` オプションを指定すると、null 値の並び位置を制御できます。

```ts
const gassma = new Gassma.GassmaClient();

// null 値を最後に配置
const result = gassma.sheets.sheet1.findMany({
  orderBy: {
    age: { sort: "asc", nulls: "last" },
  },
});
// => [20, 22, 31, 40, 55, null, null]
```

| nulls の値 | 動作 |
| --- | --- |
| `"first"` | null 値を先頭に配置 |
| `"last"` | null 値を末尾に配置 |

`nulls` を指定しない場合、`asc` では null が先頭に、`desc` では null が末尾に配置されます。

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

### リレーションフィールドでのソート

リレーション定義がある場合、manyToOne / oneToOne のリレーション先フィールドでソートできます。

```ts
const gassma = new Gassma.GassmaClient({
  relations: {
    Posts: {
      author: {
        type: "manyToOne",
        to: "Users",
        field: "authorId",
        reference: "id",
      },
    },
  },
});

// 投稿を著者名の昇順でソート
const result = gassma.sheets.Posts.findMany({
  orderBy: { author: { name: "asc" } },
});
```

FK が `null` のレコードは `asc` で先頭、`desc` で末尾に配置されます。

:::caution
oneToMany / manyToMany のリレーションではフィールドソートはできません。`RelationOrderByUnsupportedTypeError` がスローされます。
:::

### _count でのソート

oneToMany / manyToMany のリレーション件数でソートできます。

```ts
// 投稿数の多い順にユーザーをソート
const result = gassma.sheets.Users.findMany({
  orderBy: { posts: { _count: "desc" } },
});
```

スカラーソートと組み合わせることもできます。

```ts
// 投稿数の降順 → 同数なら名前の昇順
const result = gassma.sheets.Users.findMany({
  orderBy: [
    { posts: { _count: "desc" } },
    { name: "asc" },
  ],
});
```

:::caution
manyToOne / oneToOne のリレーションでは `_count` ソートはできません。`RelationOrderByCountUnsupportedTypeError` がスローされます。
:::

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

### take に負数を指定した場合

`take` に負数を指定すると、末尾から N 件を取得します。

```ts
// 条件に合致した行の末尾 2 件を取得
const result = gassma.sheets.sheet1.findMany({
  where: {
    age: { gte: 20 },
  },
  take: -2,
});
```

`take` が負数の場合、`skip` の方向も逆転します。`skip` は末尾から除外する件数になります。

```ts
// 末尾 1 件を除外した後、残りの末尾 2 件を取得
const result = gassma.sheets.sheet1.findMany({
  take: -2,
  skip: 1,
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

:::caution
`skip` に負数を指定すると `GassmaSkipNegativeError` がスローされます。
:::

## cursor

カーソルベースのページネーションを行えます。`cursor` にレコードを一意に特定するオブジェクトを指定すると、そのレコードを起点として取得します。

```ts
const gassma = new Gassma.GassmaClient();

// id: 3 のレコードを起点に、そこから 5 件取得
const result = gassma.sheets.sheet1.findMany({
  cursor: { id: 3 },
  take: 5,
});
```

`take` が正数の場合、cursor の位置から末尾方向に取得します。`take` が負数の場合、先頭から cursor の位置までを取得します。

```ts
// id: 3 を起点に、先頭方向のデータを取得
const result = gassma.sheets.sheet1.findMany({
  cursor: { id: 3 },
  take: -5,
});
```

`skip` と組み合わせると、cursor 位置からさらにスキップできます。

```ts
// id: 3 を起点に、1 件スキップして 5 件取得
const result = gassma.sheets.sheet1.findMany({
  cursor: { id: 3 },
  skip: 1,
  take: 5,
});
```

:::note
cursor に指定したレコードが見つからない場合は空配列が返されます。
:::

### 処理順序

`cursor` を含む場合の実行順序は以下の通りです。

1. `where` - フィルター
2. `orderBy` - ソート
3. `distinct` - 重複削除
4. `cursor` - カーソル位置で切り出し
5. `skip` / `take` - ページネーション
6. `select` / `omit` - フィールド整形

## omit

戻り値から特定の列を除外することができます。`select` の逆の動作です。

例えば`postNumber`を除外したい場合は以下のようになります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.sheets.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheets.sheet1.findMany({
  where: {
    pref: "Tokyo",
  },
  omit: {
    postNumber: true,
  },
});
```

戻り値は以下のようになります。

```ts
[
  { name: "sato", age: 31, pref: "Tokyo" },
  { name: "endo", age: 55, pref: "Tokyo" },
];
```

:::caution
`select` と `omit` は同時に使用できません。両方指定すると `GassmaFindSelectOmitConflictError` がスローされます。
:::

[グローバル omit](/docs/reference/config/global-omit) を設定している場合、クエリの `omit` で `{ field: false }` を指定することでグローバル omit を上書きできます。詳しくは[クエリ omit でグローバル omit を上書き](/docs/reference/config/global-omit#クエリ-omit-でグローバル-omit-を上書き)を参照してください。

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

## include

リレーション定義がある場合、リレーション先のデータを一緒に取得できます。

詳しくは[include のリファレンス](/docs/reference/relation/include)を参照してください。
