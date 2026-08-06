
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

| | 書き方 |
| --- | --- |
| スキーマ（CLI） | `previewFeatures = ["strictUndefinedChecks"]` |
| コンストラクタ（[GAS エディタ](/docs/reference/gas-editor)） | `strictUndefinedChecks: true` |

### previewFeatures で有効化（CLI あり）

CLI を使う場合は、`schema.prisma` の `generator` ブロックに `previewFeatures` を追加します（Prisma と同じ書き方です）。

```prisma
generator client {
  provider        = "prisma-client-js"
  output          = "./src/generated/gassma"
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

無効時（デフォルト）は、後述のとおり `undefined` は「そのフィールドを指定しなかった」扱いになります。意図しない `undefined` が紛れ込むと、条件が静かに消えて対象行が広がる（上の例なら `deleteMany` が全件削除になる）事故につながります。有効化しておけば、こうしたバグを実行時に即座に検出できます。

フィールドを省略したい場合は、`undefined` の代わりに `Gassma.skip` を使用してください。

```ts
gassma.Users.deleteMany({
  where: { name: userName ?? Gassma.skip },
});
// name の条件が省かれた状態で実行される
```

## 無効時の挙動（デフォルト）

`strictUndefinedChecks` が無効の場合、クエリ入力の `undefined` は Prisma と同じく**「そのフィールドを指定しなかった」扱い**になります。`where` の条件・演算子の中（`equals` / `gt` / `in` など）・`AND` / `OR` / `NOT` の中・リレーションフィルタ・`orderBy`・`select` のキーなど、クエリ入力のあらゆる箇所で同様です。

```ts
// age の条件は「指定しなかった」扱いになり、全件が返る
gassma.Users.findMany({
  where: { age: undefined },
});
```

`update` の `data` に `undefined` を渡した場合も同様に、**そのフィールドは更新されません**（セルの値は保持されます）。

```ts
gassma.Users.update({
  where: { id: 1 },
  data: { name: undefined, age: 21 },
});
// => name は元の値のまま、age だけが 21 に更新される
```

`where` の条件が `undefined`（または `Gassma.skip`）だけで空になった場合、`findMany` / `updateMany` / `deleteMany` などでは**全件が対象**になります。単一行操作の `update` / `delete` / `upsert` では空の `where` は `GassmaInvalidValueError` になります（[update](/docs/reference/crud/update/update) を参照）。

## exactOptionalPropertyTypes の推奨

`undefined` の代入を型レベルでも完全に禁止するには、利用側プロジェクトの `tsconfig.json` で `exactOptionalPropertyTypes` を有効にすることを推奨します（Prisma と同じです）。

```json
{
  "compilerOptions": {
    "exactOptionalPropertyTypes": true
  }
}
```

これにより、オプショナルなフィールドへ `undefined` を明示的に渡すコードがコンパイルエラーになります。

## 配列内では使えない

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

配列の要素としての `undefined` も同様です。`in` / `notIn` / `AND` / `OR` / `NOT` / `orderBy` / `distinct` などの配列に `undefined` の要素が含まれる場合、`strictUndefinedChecks` の有効・無効に関わらず `GassmaUndefinedValueError` がスローされます（Prisma と同じ挙動です）。

```ts
gassma.Users.findMany({
  where: {
    id: { in: [1, undefined, 3] },
  },
});
// => GassmaUndefinedValueError:
//    Invalid value for argument `where.id.in[1]`: explicitly `undefined` values are not allowed.
```


## バリデーション

| エラー | 原因 |
| --- | --- |
| `GassmaUndefinedValueError` | `strictUndefinedChecks` 有効時にクエリ入力へ明示的な `undefined` を指定。配列の要素への `undefined` は有効・無効に関わらず発生 |
| `GassmaSkipInArrayError` | 配列の要素に `Gassma.skip` を指定（有効・無効に関わらず発生） |
| `GassmaInvalidValueError` | `undefined` / `Gassma.skip` の除去によって `update` / `delete` / `upsert` の `where` が空になった |
