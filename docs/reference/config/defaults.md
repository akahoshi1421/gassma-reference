
# defaults（@default）

Prisma の `@default()` に相当する機能です。`create` 時にフィールドのデフォルト値を自動設定します。

## スキーマ版とコンストラクタ版

CLI を使う場合、この設定は `schema.prisma` に書きます。GAS エディタだけで使う場合は `GassmaClient` のコンストラクタに渡します（このページの以降の例はコンストラクタ版です）。

| | 書き方 |
| --- | --- |
| スキーマ（CLI） | `role String @default("USER")` |
| コンストラクタ（[GAS エディタ](/docs/reference/gas-editor)） | `defaults: { Users: { role: "USER" } }` |

```prisma
model Users {
  id        Int      @id
  name      String
  role      String   @default("USER")
  createdAt DateTime @default(now())
}
```

スキーマでの書き方は[スキーマ](/docs/reference/schema)にまとめています。

## 基本的な使い方

```ts
const gassma = new Gassma.GassmaClient({
  defaults: {
    Users: {
      role: "USER",
      createdAt: () => new Date(),
    },
  },
});

// create 時にデフォルト値が自動適用
gassma.Users.create({
  data: { name: "Alice" },
});
// => { name: "Alice", role: "USER", createdAt: 2026-03-14T... }
```

## 静的値と関数

デフォルト値には固定値と関数の両方を指定できます。

| 指定方法 | 例 | 動作 |
| --- | --- | --- |
| 静的値 | `role: "USER"` | 毎回同じ値を設定 |
| 関数 | `createdAt: () => new Date()` | 呼び出しごとに評価 |

## 適用されるメソッド

| メソッド | 適用 |
| --- | --- |
| `create` | ✅ |
| `createMany` / `createManyAndReturn` | ✅ |
| `upsert`（create 部分のみ） | ✅ |

## 明示指定時の動作

フィールドが明示的に指定されている場合（`null` を含む）、デフォルト値は適用されません。

```ts
gassma.Users.create({
  data: { name: "Alice", role: "ADMIN" },
});
// => role は "ADMIN"（デフォルト値 "USER" は適用されない）
```

## デフォルト値の検証

デフォルト値として適用される値も、`data` に直接書いた値と同じ検証を受けます。セルに保存できない値を返した場合は `GassmaInvalidValueError` がスローされ、行は 1 件も書き込まれません。

```ts
const gassma = new Gassma.GassmaClient({
  defaults: {
    Users: { age: () => NaN },
  },
});

gassma.Users.createMany({ data: [{ name: "Alice" }] });
// => Invalid value for argument `age`. Expected a finite number, but received NaN.
```

`{argumentName}` にはカラム名が入ります。`NaN` / `Infinity` / `-Infinity`、不正な Date（Invalid Date）、`Date` 以外のオブジェクトなどが対象です。詳しくは[エラー一覧](/docs/reference/errors#セルに保存できない値)を参照してください。
