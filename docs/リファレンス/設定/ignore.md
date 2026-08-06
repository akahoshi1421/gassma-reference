---
sidebar_position: 5
slug: /reference/config/ignore
description: "フィールドやシート全体をすべての操作の対象から除外する（@ignore / @@ignore）"
---

# ignore / ignoreSheets（@ignore / @@ignore）

Prisma の `@ignore`（フィールドレベル）と `@@ignore`（モデルレベル）に相当する機能です。

## スキーマ版とコンストラクタ版

CLI を使う場合、この設定は `schema.prisma` に書きます。GAS エディタだけで使う場合は `GassmaClient` のコンストラクタに渡します（このページの以降の例はコンストラクタ版です）。

| | 書き方 |
| --- | --- |
| スキーマ（CLI） | `@ignore` / `@@ignore` |
| コンストラクタ（[GAS エディタ](/docs/reference/gas-editor)） | `ignore: { ... }` / `ignoreSheets: [ ... ]` |

```prisma
model Users {
  id           Int    @id
  name         String
  secretColumn String @ignore
}

model Logs {
  id      Int    @id
  message String

  @@ignore
}
```

スキーマでの書き方は[スキーマ](/docs/reference/schema)にまとめています。

## ignore（フィールドレベル）

指定したフィールドを全操作から完全に除外します。

```ts
const gassma = new Gassma.GassmaClient({
  ignore: {
    Users: ["secretColumn", "internalData"],
  },
});

// 読み取り結果から除外される
gassma.Users.findMany({});
// => [{ id: 1, name: "Alice" }]（secretColumn, internalData は含まれない）

// 書き込みデータからも除外される
gassma.Users.create({
  data: { name: "Alice", secretColumn: "xxx" },
});
// => secretColumn は無視される
```

単一カラムの場合は文字列で指定できます。

```ts
ignore: {
  Users: "secretColumn",
}
```

### 除外される箇所

- **読み取り結果**: find / create / update / delete / upsert の返り値
- **書き込みデータ**: create / createMany / upsert の data
- **where 条件**: where 句からも除外

### グローバル omit との違い

| | `ignore` | グローバル `omit` |
| --- | --- | --- |
| オーバーライド | 不可 | `omit: \{field: false\}` で無効化可能 |
| 書き込み除外 | ✅ | ❌（読み取りのみ） |
| where 除外 | ✅ | ❌ |

## ignoreSheets（モデルレベル）

指定したシートをクライアントから完全に除外します。

```ts
const gassma = new Gassma.GassmaClient({
  ignoreSheets: ["Logs", "Temp"],
});

// gassma.Logs → undefined（除外済み）
// gassma.Users → 通常通り利用可能
```

単一シートの場合は文字列で指定できます。

```ts
ignoreSheets: "Logs",
```

:::note
`@@ignore` / `@ignore` はクライアントから見えなくするだけで、シートや列そのものには手を付けません。[migrate / db push](/docs/reference/migrate) でも作成対象一覧に残るため、`--accept-data-loss` を付けても削除されません。クライアントには出さずにシートだけ残したい場合に使えます（[消したくないシートを守る](/docs/reference/migrate#消したくないシートを守る)）。
:::
