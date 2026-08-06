
# raw（数式の書き込み）

`Gassma.raw(value)` は、そのセルに限って数式インジェクション対策の自動エスケープを回避し、値を**そのまま**シートに書き込むためのヘルパーです。`=` で始まる文字列を渡すと、セルには**本物のスプレッドシート数式**として書き込まれます。

## 既定の保護（自動エスケープ）

GASsma は書き込み時、`=`・`+`・`-`・`@` のいずれかで始まる文字列の先頭に `'`（シングルクォート）を付けてエスケープします。これにより、フォーム入力などに紛れ込んだ `=IMPORTRANGE(...)` のような文字列が数式として実行されること（数式インジェクション）を防いでいます。

- エスケープの対象は**文字列のみ**です。数値・boolean・Date はそのまま書き込まれます。ただし `NaN` / `Infinity` / `-Infinity` や不正な Date（Invalid Date）は、エスケープ以前に書き込み自体が `GassmaInvalidValueError` で拒否されます。
- `'` はスプレッドシート上の表示・読み取りには現れないため、エスケープされたセルを GASsma で読み直すと元の文字列（例: `"=1+2"`）がそのまま返ります。

この保護は常時有効なため、集計用の数式を意図的に書き込みたい場合には邪魔になります。そのためのオプトアウトが `Gassma.raw` です。

## 基本的な使い方

`data` の値を `Gassma.raw()` で包むと、そのセルだけエスケープが行われません。主な用途は、数値カラムへの集計数式の書き込みです。

```ts
const gassma = new GassmaClient();

gassma.Report.create({
  data: {
    title: userInput, // 通常どおりエスケープされる
    total: Gassma.raw("=SUM(B2:B10)"), // このセルだけ数式として書き込まれる
  },
});
```

同じ書き込みの中でも、`Gassma.raw()` を使っていないカラム（上の `title`）は従来どおり保護されたままです。

`create` 系・`update` 系のすべてのメソッド（`create` / `createMany` / `createManyAndReturn` / `update` / `updateMany` / `updateManyAndReturn` / `upsert`）と、nested write の `create` / `createMany` / `connectOrCreate` の `create` で使用できます。

## 戻り値は計算結果ではない

`create` / `update` などの戻り値は「**書き込んだ内容のエコー**」です。GASsma は書き込み後にシートを読み直さないため、数式の**計算結果は返りません**。数値カラムに数式を書き込んだ場合、戻り値は数式の**文字列**になります。

```ts
const created = gassma.FormulaCell.create({
  data: { id: 4, label: "delta", amount: 60, total: Gassma.raw("=C5*2") },
});
created.total; // "=C5*2"（数式文字列。計算結果ではない）
```

計算結果が必要な場合は、書き込み後に読み直してください。

```ts
const readBack = gassma.FormulaCell.findFirstOrThrow({ where: { id: 4 } });
readBack.total; // 120（セル上で計算された結果が返る）
```

## raw の効果は渡したセルだけ

`Gassma.raw()` の効果は、それを渡した**そのセルだけ**に限られます。

- 同じ行の他のカラムは通常どおりエスケープされます。
- nested write で子行に引き渡される FK 値など、raw セルを参照する他の書き込みが raw として扱われることもありません。

```ts
gassma.FormulaCell.create({
  data: {
    id: 4,
    label: "=1+2", // エスケープされ、文字列 "=1+2" のまま
    amount: 60,
    total: Gassma.raw("=C5*2"), // 数式として書き込まれ、セル上で計算される
  },
});
```

## $transaction との組み合わせ

[$transaction](/docs/reference/transaction) 内でも使用できます。raw の値はコミット時にまとめてシートへ書き込まれ、その時点で数式になります。

コミット前の tx 内の読み取り（read-your-writes）では、まだシートに書き込まれていないため**数式文字列のまま**見えます。

```ts
gassma.$transaction((tx) => {
  tx.FormulaCell.create({
    data: { id: 4, label: "delta", amount: 60, total: Gassma.raw("=C5*2") },
  });

  const buffered = tx.FormulaCell.findFirstOrThrow({ where: { id: 4 } });
  buffered.total; // "=C5*2"（コミット前なので計算されていない）
});

// コミット後はセルに数式として書き込まれ、計算結果が読める
const readBack = gassma.FormulaCell.findFirstOrThrow({ where: { id: 4 } });
readBack.total; // 120
```

## 型

`Gassma.raw(value: string)` は `Gassma.RawValue` 型を返します。

- 生成型では、`data` の**すべてのカラム**が `Gassma.RawValue` を受け付けます。数式はセル上で任意の型の値を返せるため、数値・boolean・Date のカラムにも渡せます。
- `where` では使用できません。書き込み専用です。`where` の値に渡すと `GassmaInvalidValueError`（Expected a scalar value, but received a Gassma.raw value.）がスローされます。

## 信頼できない入力には使わない

`Gassma.raw()` に**ユーザー入力を渡してはいけません**。既定の保護を回避するため、数式インジェクションに対して脆弱になります。

```ts
// 危険: フォーム入力をそのまま raw に渡している
function onFormSubmit(e) {
  const gassma = new GassmaClient();
  gassma.Answers.create({
    data: {
      // 悪意のあるユーザーが "=IMPORTRANGE(...)" を入力すると
      // 数式として実行されてしまう
      name: Gassma.raw(e.namedValues["名前"][0]),
    },
  });
}
```

`Gassma.raw()` は、自分で書いた固定の数式など、**信頼できる値のみ**に使用してください。ユーザー入力は `Gassma.raw()` で包まずそのまま渡せば、既定の保護が適用されます。
