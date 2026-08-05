---
sidebar_position: 6
slug: /reference/config/map
description: "コード側の名前をスプレッドシートのヘッダー名・シート名に対応付ける（@map / @@map）"
---

# map / mapSheets（@map / @@map）

Prisma の `@map("name")`（フィールドレベル）と `@@map("name")`（モデルレベル）に相当する機能です。コード上の名前とスプレッドシート上の名前をマッピングします。

## スキーマ版とコンストラクタ版

CLI を使う場合、この設定は `schema.prisma` に書きます。GAS エディタだけで使う場合は `GassmaClient` のコンストラクタに渡します（このページの以降の例はコンストラクタ版です）。

| | 書き方 |
| --- | --- |
| スキーマ（CLI） | `@map("名前")` / `@@map("ユーザー一覧")` |
| コンストラクタ（[GAS エディタ](/docs/reference/gas-editor)） | `map: { ... }` / `mapSheets: { ... }` |

```prisma
model Users {
  id        Int    @id
  firstName String @map("名前")
  lastName  String @map("名字")

  @@map("ユーザー一覧")
}
```

スキーマでの書き方は[スキーマ](/docs/reference/schema)にまとめています。

## map（フィールドレベル）

コード上のフィールド名とスプレッドシートのヘッダー名を異なる名前でマッピングします。

```ts
const gassma = new Gassma.GassmaClient({
  map: {
    Users: {
      firstName: "名前",
      lastName: "名字",
    },
  },
});

// コード上は英語名で操作
gassma.Users.create({
  data: { firstName: "Alice", lastName: "Smith" },
});
// → スプレッドシートの「名前」「名字」カラムに書き込まれる

gassma.Users.findFirst({
  where: { firstName: "Alice" },
});
// => \{ firstName: "Alice", lastName: "Smith" \}
```

### 変換が適用される箇所

- **書き込みデータ**: create / createMany / update / updateMany / upsert でコード名→ヘッダー名に変換
- **読み取り結果**: find / create / update / upsert の返り値でヘッダー名→コード名に変換
- **where 条件**: コード名→ヘッダー名に変換してからフィルタ

## mapSheets（モデルレベル）

コード上のモデル名とスプレッドシートのシート名をマッピングします。

```ts
const gassma = new Gassma.GassmaClient({
  mapSheets: {
    Users: "ユーザー一覧",
    Posts: "投稿データ",
  },
});

// コード上は英語名でアクセス
gassma.Users.findMany({});
// → 内部ではシート名「ユーザー一覧」に対して操作
```

### 他オプションとの組み合わせ

`mapSheets` を指定した場合、他のオプション（`omit`、`defaults`、`updatedAt`、`ignore`、`map` 等）にはコード名を使用します。

```ts
const gassma = new Gassma.GassmaClient({
  mapSheets: {
    Users: "ユーザー一覧",
  },
  defaults: {
    Users: { role: "USER" },  // ← "ユーザー一覧" ではなく "Users"
  },
});
```
