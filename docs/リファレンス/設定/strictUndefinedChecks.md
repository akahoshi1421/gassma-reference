---
sidebar_position: 8
slug: /reference/config/strict-undefined-checks
---

# strictUndefinedChecks / Gassma.skip

Prisma の `strictUndefinedChecks`（Preview 機能）と `Prisma.skip` に相当する機能です。クエリ入力に紛れ込んだ意図しない `undefined` を実行時エラーとして検出し、フィールドを省略したい場合は `Gassma.skip` で明示的に指定できるようになります。

## Gassma.skip

`Gassma.skip` はクエリのフィールド値として渡すと、そのフィールドを「指定しなかった」ことにするシンボルです。

```ts
const search: string | undefined = getSearchWord();

const users = gassma.Users.findMany({
  where: {
    // search がない場合は name の条件自体を省く
    name: search ?? Gassma.skip,
  },
});
```

`Gassma.skip` は `strictUndefinedChecks` の有効・無効に関わらず常に使用できます。`where` / `data` / `create` / `update` / `select` / `omit` / `orderBy` など、クエリ入力のあらゆる箇所で利用可能です。

## strictUndefinedChecks の有効化

`strictUndefinedChecks` はオプトインの機能です。有効化する方法は 2 つあります。

### previewFeatures で有効化（CLI あり）

[Prisma スキーマを利用したローカル開発](/docs/reference/type-generation)をしている場合は、`schema.prisma` の `generator` ブロックに `previewFeatures` を追加します（Prisma と同じ書き方です）。

```prisma
generator client {
  provider        = "prisma-client-js"
  output          = "./generated/gassma"
  previewFeatures = ["strictUndefinedChecks"]
}
```

`npx gassma generate` を実行すると、生成されるクライアントに `strictUndefinedChecks: true` が自動的に埋め込まれます。あわせて生成される型定義にも `Gassma.skip` を受け付ける型（`Gassma.SkipValue`）が反映されます。

### コンストラクタで有効化（CLI なし）

CLI を使わない構成では、`GassmaClient` のコンストラクタで指定します。

```ts
const gassma = new Gassma.GassmaClient({
  strictUndefinedChecks: true,
});
```

## 有効時の挙動

有効化すると、クエリ入力に**明示的な `undefined`** が含まれる場合に `GassmaUndefinedValueError` がスローされます。ネストした入力（Nested Write、`include` 内の `select` など）も再帰的にチェックされます。

```ts
const userName = undefined;

gassma.Users.deleteMany({
  where: { name: userName },
});
// => GassmaUndefinedValueError:
//    Invalid value for argument `where.name`: explicitly `undefined` values are not allowed.
```

意図しない `undefined` がクエリに紛れ込むと、条件が意図せず変化したり、`update` で `undefined` がそのまま値として書き込まれたりする事故につながります。有効化しておけば、こうしたバグを実行時に即座に検出できます。

フィールドを省略したい場合は、`undefined` の代わりに `Gassma.skip` を使用してください。

```ts
gassma.Users.deleteMany({
  where: { name: userName ?? Gassma.skip },
});
// name の条件が省かれた状態で実行される
```

## exactOptionalPropertyTypes の推奨

:::note
`undefined` の代入を型レベルでも完全に禁止するには、利用側プロジェクトの `tsconfig.json` で `exactOptionalPropertyTypes` を有効にすることを推奨します（Prisma と同じです）。

```json
{
  "compilerOptions": {
    "exactOptionalPropertyTypes": true
  }
}
```

これにより、オプショナルなフィールドへ `undefined` を明示的に渡すコードがコンパイルエラーになります。
:::

## 配列内では使えない

:::caution
配列の要素として `Gassma.skip` を渡すことはできません。`strictUndefinedChecks` の有効・無効に関わらず `GassmaSkipInArrayError` がスローされます。`null` を使うか、事前に配列から取り除いてください。

```ts
gassma.Users.findMany({
  where: {
    id: { in: [1, Gassma.skip, 3] },
  },
});
// => GassmaSkipInArrayError:
//    Invalid value for argument `where.id.in[1]`: Can not use `Gassma.skip` value
//    within array. Use `null` or filter out `Gassma.skip` values.
```

:::

## バリデーション

| エラー | 原因 |
| --- | --- |
| `GassmaUndefinedValueError` | `strictUndefinedChecks` 有効時にクエリ入力へ明示的な `undefined` を指定 |
| `GassmaSkipInArrayError` | 配列の要素に `Gassma.skip` を指定（有効・無効に関わらず発生） |
