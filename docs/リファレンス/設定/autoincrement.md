---
sidebar_position: 7
slug: /reference/config/autoincrement
description: "LockService + PropertiesService を使ったフィールドの自動インクリメント（GAS のみ）"
---

# autoincrement

Prisma の `autoincrement()` に相当する機能です。`create` 時に一意で単調増加する値を自動的に割り当てます。

## スキーマ版とコンストラクタ版

CLI を使う場合、この設定は `schema.prisma` に書きます。GAS エディタだけで使う場合は `GassmaClient` のコンストラクタに渡します（このページの以降の例はコンストラクタ版です）。

| | 書き方 |
| --- | --- |
| スキーマ（CLI） | `id Int @id @default(autoincrement())` |
| コンストラクタ（[GAS エディタ](/docs/reference/gas-editor)） | `autoincrement: { Users: "id" }` |

```prisma
model Users {
  id   Int    @id @default(autoincrement())
  name String
}
```

スキーマでの書き方は[スキーマ](/docs/reference/schema)にまとめています。

## 基本的な使い方

```ts
const gassma = new Gassma.GassmaClient({
  autoincrement: {
    Users: "id",
  },
});

// create 時に自動で id が振られる
gassma.Users.create({
  data: { name: "Alice" },
});
// => \{ id: 1, name: "Alice" \}

gassma.Users.create({
  data: { name: "Bob" },
});
// => \{ id: 2, name: "Bob" \}
```

## 複数カラム対応

配列で複数カラムを指定できます。

```ts
autoincrement: {
  Users: ["id", "seq"],
}
```

## createMany での動作

`createMany` では全行分のカウンターを一括確保してから各行に割り当てます。

```ts
gassma.Users.createMany({
  data: [{ name: "Alice" }, { name: "Bob" }],
});
// => id: 1, 2 がそれぞれ割り当てられる
```

## 仕組み

1. `GassmaClient` の [`lock`](/docs/reference/transaction#ロック) を `waitLock(10000)` で取得して排他制御
2. `PropertiesService.getScriptProperties()` からカウンターを読み取り
3. +1（createMany の場合は +N）して書き込み
4. ロック解放

`npx gassma generate` が生成するクライアントは、`lock` に `LockService.getScriptLock()` を既定で埋めます。`lock` を持たないクライアント（[GAS エディタ](/docs/reference/gas-editor)で `lock` を渡さずに生成した場合など）では、**ロックを取らずに採番します**（エラーにはなりません）。

:::note
GAS の `LockService` と `PropertiesService` を使用するため、GAS 環境でのみ動作します。
:::

## 明示指定時の動作

フィールドに明示的に値を指定した場合、自動採番はスキップされます。

```ts
gassma.Users.create({
  data: { id: 100, name: "Alice" },
});
// => id は 100（自動採番されない）
```

## 既存データがあるシートに導入する場合

カウンターは 0 から始まり、**シートに入っている値は見ません**。そのため `id` が 1〜500 まで入っているシートに GASsma を導入すると、最初の `create` が `id: 1` を採番して既存の行と衝突します。

`$syncAutoincrement()` を呼ぶと、その列に入っている最大値の次からカウンターを再開できます。導入時に一度呼んでおいてください。

```ts
// 既存データの id が 1〜500 のとき
gassma.Users.$syncAutoincrement("id");
// => 501

gassma.Users.create({
  data: { name: "Alice" },
});
// => { id: 501, name: "Alice" }
```

スプレッドシートを手で編集して行を追加し、カウンターとずれてしまった場合も、`$syncAutoincrement()` を呼び直せば同じように合わせ直せます。

## カウンターを操作する

Prisma では `autoincrement()` に引数を渡せず、カウンターの調整は `ALTER SEQUENCE ... RESTART WITH` のような SQL で行います。GASsma のカウンターは `PropertiesService` にあってスキーマからも SQL からも触れないため、代わりにモデルのメソッドとして提供しています。

やり取りする値は 3 つとも**「次に発行される値」**で統一されています。`ALTER SEQUENCE ... RESTART WITH 1000` と同じ意味です。

| メソッド | 戻り値 | 説明 |
| --- | --- | --- |
| `$getAutoincrement(field)` | `number` | 次に発行される値を返す（一度も採番していなければ `1`） |
| `$setAutoincrement(field, next)` | `void` | 次に発行される値を `next` にする |
| `$syncAutoincrement(field)` | `number` | 列の最大値 + 1 をカウンターに設定し、その値を返す |

```ts
gassma.Users.$getAutoincrement("id");
// => 1

gassma.Users.$setAutoincrement("id", 501);

gassma.Users.$getAutoincrement("id");
// => 501
```

`$setAutoincrement` は値を自分で決めたいときに使います。既存データに合わせたいだけなら `$syncAutoincrement` を使ってください。

### $syncAutoincrement が見る値

- 対象フィールドの列だけを読みます（シート全体は読みません）
- **数値だけ**を見て最大値を取ります。空のセルや数値以外の値は無視されます
- 小数は切り捨てます（`3.7` があれば次は `4`）
- 数値が 1 つもない場合や負数しかない場合は、次の値が `1` になります

### 関連エラー

| エラー | 発生条件 |
| --- | --- |
| `GassmaAutoincrementNotConfiguredError` | autoincrement を設定していないフィールドを `field` に指定 |
| `GassmaAutoincrementInTransactionError` | `$transaction` の中から `$setAutoincrement` / `$syncAutoincrement` を呼び出し |
| `GassmaInvalidValueError` | `$setAutoincrement` の `next` が 1 以上の整数でない（`NaN` / `Infinity` / 小数 / 0 以下 / 数値以外） |
| `GassmaInvalidValueError` | `$syncAutoincrement` で、autoincrement を設定したフィールドの列がシートに存在しない（列名を変えた場合など） |

詳細は[エラー一覧](/docs/reference/errors)を参照してください。

:::caution
`$setAutoincrement` / `$syncAutoincrement` は [$transaction](/docs/reference/transaction) の中からは呼べません。カウンターは `PropertiesService` にあってシートのバッファに乗らないため、トランザクションが失敗してもロールバックされないからです。`$getAutoincrement` は読み取りだけなのでトランザクション内でも呼べます。
:::
