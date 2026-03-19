---
sidebar_position: 6
slug: /reference/config/map
---

# map / mapSheets（@map / @@map）

Prisma の `@map("name")`（フィールドレベル）と `@@map("name")`（モデルレベル）に相当する機能です。コード上の名前とスプレッドシート上の名前をマッピングします。

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
gassma.sheets.Users.create({
  data: { firstName: "Alice", lastName: "Smith" },
});
// → スプレッドシートの「名前」「名字」カラムに書き込まれる

gassma.sheets.Users.findFirst({
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
gassma.sheets.Users.findMany({});
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
