
# findMany()

特定の条件に合致したすべての行を取り出したい場合に利用します。

## 使用できるキー

| キー名   | 内容             | 省略 | 備考                                          |
| -------- | ---------------- | ---- | --------------------------------------------- |
| where    | 取得条件の指定   | 可   | 書かない場合や `where: {}` の場合は全ての行を取得します |
| select   | 取得列の表示設定 | 可   | `omit` / `include` と同時に使用できません。リレーションフィールドにオプション指定可 |
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
const gassma = new GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheet1.findMany({
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
const gassma = new GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheet1.findMany({
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
const gassma = new GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheet1.findMany({
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
const gassma = new GassmaClient();

// "alice"、"Alice"、"ALICE" すべてにマッチ
const result = gassma.sheet1.findMany({
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
const result = gassma.sheet1.findMany({
  where: {
    title: {
      contains: "hello",
      mode: "insensitive",
    },
  },
});
```

`mode` を指定しない場合、またはデフォルトの `mode: "default"` の場合は大文字小文字が区別されます。

`where` の値には `NaN` / `Infinity` / `-Infinity`、不正な Date（Invalid Date）、配列（`in` / `notIn` の配列を除く）、関数、Symbol、BigInt を渡せません。渡すと `GassmaInvalidValueError` がスローされます（`cursor` / `having` も同様）。`Gassma.raw` も `where` では使用できません（[raw](/docs/reference/raw) を参照）。

セルに保存できないオブジェクトも同様に渡せません。`Date` と `fields`（FieldRef）以外のオブジェクト —— `Map` / `Set` / `RegExp` / `Error` / クラスのインスタンス / `new String("x")` のようなラッパーオブジェクトなど —— はすべて `GassmaInvalidValueError` になります。

```ts
gassma.sheet1.findMany({ where: { name: new Map() } });
// => Invalid value for argument `name`. Expected a scalar value, but received a Map.

gassma.sheet1.findMany({ where: { name: new Point(1, 2) } });
// => Invalid value for argument `name`. Expected a scalar value, but received an object.
```

また、値が `undefined` の条件は「指定しなかった」扱いになります。詳しくは [strictUndefinedChecks / Gassma.skip](/docs/reference/config/strict-undefined-checks) を参照してください。

## AND, OR, NOT

複数条件での検索も可能です。

### AND

例えば以下の条件で行を取り出したいとします。

- age => **22**
- pref => **Ibaraki**

AND を利用して検索する場合以下のようになります。

```ts
const gassma = new GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheet1.findMany({
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
const gassma = new GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheet1.findMany({
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
const gassma = new GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheet1.findMany({
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
const gassma = new GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheet1.findMany({
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

### 空の AND, OR, NOT と条件を持たないブランチ

空の `AND` / `NOT`（`[]` や `{}`）は**恒真**（全件にマッチ）、空の `OR: []` は**恒偽**（0 件）として扱われます（Prisma と同じです）。

また、条件を 1 つも生成しないブランチ（`{}` や、値が空オブジェクト・`undefined` だけのオブジェクト）は、`AND` / `OR` / `NOT` の配列から取り除かれます。その結果 `OR` の配列が空になった場合は 0 件になります。

```ts
gassma.sheet1.findMany({ where: { NOT: {} } }); // => 全件
gassma.sheet1.findMany({ where: { AND: [] } }); // => 全件
gassma.sheet1.findMany({ where: { OR: [] } }); // => []

gassma.sheet1.findMany({ where: { OR: [{ age: {} }] } }); // => []（条件ゼロのブランチが除去され、空の OR になる）
gassma.sheet1.findMany({ where: { OR: [{}, { name: "akahoshi" }] } }); // => name が "akahoshi" の行のみ
gassma.sheet1.findMany({ where: { NOT: [{ age: {} }] } }); // => 全件
gassma.sheet1.findMany({ where: { AND: [{ OR: [] }] } }); // => 全件
```

`OR` には配列以外を渡せません。`OR: {}` のように配列以外を渡すと `GassmaInvalidValueError` がスローされます。

### where でのリレーションフィルタ

リレーション定義がある場合、`where` 内でリレーション先の条件を使ってフィルタリングできます（`some`、`every`、`none`、`is`、`isNot`）。

詳しくは [where リレーションフィルタのリファレンス](/docs/reference/relation/where-relation-filter)を参照してください。

## null の扱い

`null` を渡せるかどうかは「値の位置か、構造の位置か」で決まります。

### 値の位置の `null`（有効）

カラムの値として `null` を渡すのは正当な指定で、セルが空の行を検索できます。

```ts
gassma.sheet1.findMany({ where: { age: null } });
gassma.sheet1.findMany({ where: { age: { equals: null } } });
gassma.sheet1.findMany({ where: { age: { not: null } } });
```

to-one リレーション（manyToOne / oneToOne）の `is` / `isNot` に `null` を渡すのも同様に有効です（[where リレーションフィルタ](/docs/reference/relation/where-relation-filter)を参照）。`having` のカラムの値、書き込み時の `data` のカラムの値も `null` を渡せます。

### 構造の位置の `null`（エラー）

オブジェクトや配列を受け取る引数に `null` を渡すと `GassmaInvalidValueError` がスローされます。

```ts
gassma.sheet1.findMany({ where: null });
// => GassmaInvalidValueError:
//    Invalid value for argument `where`. Expected an object, but received null.

gassma.sheet1.findMany({ where: { AND: null } });
// => Invalid value for argument `AND`. Expected an object or an array, but received null.

gassma.sheet1.findMany({ where: { name: { contains: null } } });
// => Invalid value for argument `contains`. Expected a string, but received null.
```

対象は、トップレベル引数（`where` / `orderBy` / `cursor` / `distinct` / `by` / `having` / `data` / `create` / `update`）、`AND` / `OR` / `NOT`、to-many リレーションフィルタ（`some` / `every` / `none`）、Nested Write の動詞（`create` / `connect` / `connectOrCreate` / `set` / `disconnect` / `delete` / `update` / `deleteMany` / `updateMany` / `createMany`）、文字列・数値の演算子（`contains` / `startsWith` / `endsWith` / `gt` / `gte` / `lt` / `lte` / `increment` / `decrement` / `multiply` / `divide`）です。配列の要素に `null` を入れた場合も同様にエラーになります。

各引数の `{expected}` の文言は[エラー一覧](/docs/reference/errors#構造を期待する引数への-null)を参照してください。

`cursor` だけは**カラムの値にも `null` を渡せません**。`cursor` はレコードを一意に特定するための指定なので、値が `null` の場合は `GassmaInvalidValueError`（<code>Invalid value for argument \`id\`. Expected a scalar value, but received null.</code>）になります。`{argumentName}` にはカラム名が入ります。

`select` / `include` / `omit` の直下に書いた `null` は従来どおり無視されます（そのフィールドを指定しなかった扱いになります）。

## select

戻り値に返るデータを制限することができます。

例えば`age`と`pref`のみ取得したい場合は以下のようになります。

```ts
const gassma = new GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheet1.findMany({
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

`select: {}` のように選択するフィールドが 1 つもない `select` は `GassmaInvalidValueError`（Invalid value for argument `select`. Expected at least one selected field.）になります。すべてのキーが `undefined` で空になった場合も同様です。

### select 内でのリレーションオプション指定

リレーション定義がある場合、`select` 内のリレーションフィールドに `include` と同様のオプションを指定できます。`include` を別途指定する代わりに、`select` 内でリレーション先のデータ取得を制御できます。

この例ではリレーション定義をコンストラクタで示しています。CLI を使う場合、リレーションは `schema.prisma` に書きます（[リレーション定義](/docs/reference/relation/definition)）。

```ts
const gassma = new Gassma.GassmaClient({
  relations: {
    Users: {
      posts: { type: "oneToMany", to: "Posts", field: "id", reference: "authorId" },
    },
  },
});

const result = gassma.Users.findMany({
  select: {
    id: true,
    name: true,
    posts: {
      select: { id: true, title: true },
      where: { published: true },
      orderBy: { id: "desc" },
    },
    _count: true,
  },
});
```

リレーションフィールドに指定できるオプションは [include のオプション](/docs/reference/relation/include)と同じです（`select`、`where`、`orderBy`、`include`、`omit`、`take`、`skip`）。

深いネストも対応しています。

```ts
const result = gassma.Users.findMany({
  select: {
    id: true,
    posts: {
      select: {
        id: true,
        comments: {
          select: { id: true, text: true },
        },
      },
    },
  },
});
```

リレーションフィールドは `true` でも指定でき、その場合はリレーション先の全スカラー列を取得します（トップレベルの `select` と同様に、任意の深さで機能します）。

```ts
const result = gassma.Users.findMany({
  select: {
    posts: {
      select: {
        title: true,
        comments: true, // comments のスカラー列をすべて取得
      },
    },
  },
});
```

トップレベルの `select` と `include` は同時に使用できません。リレーション先のデータが必要な場合は `select` 内でリレーションオプションを指定するか、`include` を単独で使用してください。

## orderBy

取得した行をソートすることができます。

例えば`age`で昇順でソートする場合は以下のようになります。

```ts
const gassma = new GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheet1.findMany({
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
const gassma = new GassmaClient();

// null 値を最後に配置
const result = gassma.sheet1.findMany({
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

`NaN` や不正な Date（Invalid Date）も null と同じ「欠損値」として扱われ、null と同じ位置に配置されます（`nulls` オプションの対象にもなります）。

また、複数ソートの条件を指定することもでき、例えば

- `age`で昇順でソート
- `age`の値が同じ行があればその部分は`name`の昇順でソート

といったことを行いたい場合コードは以下のようになります。

```ts
const gassma = new GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheet1.findMany({
  where: {
    age: {
      gte: 20,
    },
  },
  orderBy: [{ age: "asc" }, { name: "asc" }],
});
```

※ソートの優先順位はインデックス番号の若い順となります。

`orderBy: {}` のように条件が空の場合は無視されます（並び替えは行われません）。配列内のエントリが `undefined` の除去によって空になった場合も、そのエントリだけが無視され、残りの指定で並び替えられます。

### リレーションフィールドでのソート

リレーション定義がある場合、manyToOne / oneToOne のリレーション先フィールドでソートできます。

この例ではリレーション定義をコンストラクタで示しています。CLI を使う場合、リレーションは `schema.prisma` に書きます（[リレーション定義](/docs/reference/relation/definition)）。

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
const result = gassma.Posts.findMany({
  orderBy: { author: { name: "asc" } },
});
```

FK が `null` のレコードは `asc` で先頭、`desc` で末尾に配置されます。

oneToMany / manyToMany のリレーションではフィールドソートはできません。`RelationOrderByUnsupportedTypeError` がスローされます。

リレーション名に対してオブジェクト以外の値を指定すると `GassmaInvalidValueError` がスローされます。

```ts
gassma.Posts.findMany({ orderBy: { author: new Date() } });
// => Invalid value for argument `author`. Expected a relation orderBy object.
```

リレーション先のフィールドを指定するには `orderBy: { author: { name: "asc" } }` のようにオブジェクトを渡してください。

### _count でのソート

oneToMany / manyToMany のリレーション件数でソートできます。

```ts
// 投稿数の多い順にユーザーをソート
const result = gassma.Users.findMany({
  orderBy: { posts: { _count: "desc" } },
});
```

スカラーソートと組み合わせることもできます。

```ts
// 投稿数の降順 → 同数なら名前の昇順
const result = gassma.Users.findMany({
  orderBy: [
    { posts: { _count: "desc" } },
    { name: "asc" },
  ],
});
```

manyToOne / oneToOne のリレーションでは `_count` ソートはできません。`RelationOrderByCountUnsupportedTypeError` がスローされます。

## take

取得数を指定できます。取得数はシートの上の行から順となります。

例えば条件に合致した行の中から上から 2 行を取得したい場合以下のようになります。

```ts
const gassma = new GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheet1.findMany({
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
const result = gassma.sheet1.findMany({
  where: {
    age: { gte: 20 },
  },
  take: -2,
});
```

`take` が負数の場合、`skip` の方向も逆転します。`skip` は末尾から除外する件数になります。

```ts
// 末尾 1 件を除外した後、残りの末尾 2 件を取得
const result = gassma.sheet1.findMany({
  take: -2,
  skip: 1,
});
```

## skip

取得した行の中から特定行をスキップできます。

例えば条件に合致した行の中から上 1 つ目を省きたい場合、コードは以下のようになります。

```ts
const gassma = new GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheet1.findMany({
  where: {
    age: {
      gte: 20,
    },
  },
  skip: 1,
});
```

`skip` に有限の負数を指定すると `GassmaSkipNegativeError` がスローされます。

### take / skip の異常値

`take` / `skip` に `NaN` / `Infinity` / `-Infinity` / `null` を渡すと `GassmaInvalidValueError` がスローされます。

```ts
gassma.sheet1.findMany({ take: NaN });
// => Invalid value for argument `take`. Expected a finite number, but received NaN.

gassma.sheet1.findMany({ skip: null });
// => Invalid value for argument `skip`. Expected a number, but received null.
```

| 値 | 挙動 |
| --- | --- |
| `NaN` / `Infinity` / `-Infinity` | `GassmaInvalidValueError`（`Expected a finite number, but received ...`） |
| `null` | `GassmaInvalidValueError`（`Expected a number, but received null.`） |
| 有限の負数 | `take` は末尾から取得、`skip` は `GassmaSkipNegativeError` |
| `undefined` | 指定しなかった扱いになり無視されます |

`skip: -Infinity` は、有限かどうかの判定が先に行われるため `GassmaInvalidValueError` になります。`GassmaSkipNegativeError` は**有限の**負数に対してのみスローされます。

同じ検証は `count` / `aggregate` / `groupBy` の `take` / `skip` にも適用されます。`findFirst` の `take` は[別の制限](./findFirst#take)があります。

## cursor

カーソルベースのページネーションを行えます。`cursor` にレコードを一意に特定するオブジェクトを指定すると、そのレコードを起点として取得します。

```ts
const gassma = new GassmaClient();

// id: 3 のレコードを起点に、そこから 5 件取得
const result = gassma.sheet1.findMany({
  cursor: { id: 3 },
  take: 5,
});
```

`take` が正数の場合、cursor の位置から末尾方向に取得します。`take` が負数の場合、先頭から cursor の位置までを取得します。

```ts
// id: 3 を起点に、先頭方向のデータを取得
const result = gassma.sheet1.findMany({
  cursor: { id: 3 },
  take: -5,
});
```

`skip` と組み合わせると、cursor 位置からさらにスキップできます。

```ts
// id: 3 を起点に、1 件スキップして 5 件取得
const result = gassma.sheet1.findMany({
  cursor: { id: 3 },
  skip: 1,
  take: 5,
});
```

cursor に指定したレコードが見つからない場合は空配列が返されます。

`cursor: {}` のようにカラムが 1 つもない `cursor` は `GassmaInvalidValueError`（Invalid value for argument `cursor`. Expected at least one column.）になります。すべてのキーが `undefined` で空になった場合も同様です。また、`cursor` の値に `NaN` や不正な Date（Invalid Date）などの比較できない値を渡した場合も `GassmaInvalidValueError` がスローされます。

### 処理順序

`where`・`orderBy`・`cursor`・`distinct`・`skip`・`take` を組み合わせた場合の実行順序は以下の通りです。

1. `where` - フィルター
2. `orderBy` - ソート
3. `take` が負数の場合は並びを反転
4. `cursor` - カーソル位置で切り出し（カーソル自身を含む）
5. `distinct` - 重複削除
6. `skip` - スキップ
7. `take` - 件数制限（負数の場合は絶対値の件数を取得し、最後に並びを正順へ戻す）
8. `select` / `omit` - フィールド整形

`distinct` は `cursor` の**後**に適用されます。カーソルで切り出した範囲の中で重複が削除されます。

## omit

戻り値から特定の列を除外することができます。`select` の逆の動作です。

例えば`postNumber`を除外したい場合は以下のようになります。

```ts
const gassma = new GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheet1.findMany({
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

`select` と `omit` は同時に使用できません。両方指定すると `GassmaFindSelectOmitConflictError` がスローされます。

[グローバル omit](/docs/reference/config/global-omit) を設定している場合、クエリの `omit` で `{ field: false }` を指定することでグローバル omit を上書きできます。詳しくは[クエリ omit でグローバル omit を上書き](/docs/reference/config/global-omit#クエリ-omit-でグローバル-omit-を上書き)を参照してください。

## distinct

列名を指定し、もし値が被っている場合その行を省略できます。被っている場合は上の行のデータが優先されます。

例えば`age`の被りを省略する場合、コードは以下のようになります。

```ts
const gassma = new GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.findMany
const result = gassma.sheet1.findMany({
  where: {
    age: {
      gte: 20,
    },
  },
  distinct: ["age"],
});
```

`distinct` は `cursor` の後に適用されるため、カーソルで切り出した範囲内で重複が削除されます（上記の「処理順序」を参照）。

`take` に負数を指定した場合は反転した並びで重複削除が行われるため、残る「最初の 1 件」は末尾側のレコードになります。最終的な出力は正順に戻されます。

重複の判定は値を正規化したキーで行われます。

- Date は時刻が同じであれば別インスタンスでも同じ値とみなされます。Date と同時刻の ISO 文字列は別の値です。
- 数値の `1` と文字列の `"1"` は別の値です。
- `NaN` 同士、不正な Date（Invalid Date）同士は、それぞれ同じ値として畳まれます。`NaN`・`null`・Invalid Date は互いに別の値です。

## include

リレーション定義がある場合、リレーション先のデータを一緒に取得できます。

詳しくは[include のリファレンス](/docs/reference/relation/include)を参照してください。
