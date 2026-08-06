
# 基本

## インスタンス生成

`npx gassma generate` で生成されたクライアントから `GassmaClient` を import して、そのままインスタンス化します。リレーションやデフォルト値などスキーマに書いた設定は注入済みです。

```ts
import { GassmaClient } from "./generated/gassma/schemaClient";

const gassma = new GassmaClient();
```

Prisma と同じパターンでインスタンス化できます。

```ts
// Prisma
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GASsma（同じパターン）
import { GassmaClient } from "./generated/gassma/schemaClient";
const gassma = new GassmaClient();
```

`gassma.config.ts` の `datasource.url`（またはスキーマの `datasource` ブロック）を設定していれば、対象のスプレッドシート ID は生成されたクライアントに埋め込まれるため、引数は不要です。

CLI を使わず GAS のスクリプトエディタだけで使う場合は `new Gassma.GassmaClient()` の形になります。[GAS エディタでの利用](/docs/reference/gas-editor)を参照してください。

## シートへのアクセス

モデル名がそのままプロパティになります。

```ts
const users = gassma.User.findMany({
  where: { age: { gte: 20 } },
  select: { name: true, email: true },
});
```

## オプション付きの初期化

コンストラクタにはオプションオブジェクトを渡せます。

```ts
const gassma = new GassmaClient({
  id: "SPREAD_SHEET_ID",
  omit: {
    User: { password: true },
  },
});
```

生成された `GassmaClient` のコンストラクタが受け取るのはオプションオブジェクトのみです。スプレッドシート ID を直接渡すことはできないため、`id` プロパティに指定してください。

```ts
const gassma = new GassmaClient({ id: "SPREAD_SHEET_ID" }); // OK
```

### コンストラクタオプション

| オプション | 説明 | 生成クライアントでの扱い | 参照 |
| --- | --- | --- | --- |
| `id` | スプレッドシート ID（省略時はアクティブスプレッドシート） | 渡した値が有効 | - |
| `omit` | グローバル omit 設定 | 渡した値が有効 | [グローバル omit](/docs/reference/config/global-omit) |
| `relations` | リレーション定義 | スキーマ由来（渡しても無視） | [リレーション定義](/docs/reference/relation/definition) |
| `defaults` | フィールドのデフォルト値 | スキーマ由来（渡しても無視） | [defaults](/docs/reference/config/defaults) |
| `updatedAt` | 自動更新タイムスタンプ | スキーマ由来（渡しても無視） | [updatedAt](/docs/reference/config/updated-at) |
| `ignore` | フィールドレベルの除外 | スキーマ由来（渡しても無視） | [ignore](/docs/reference/config/ignore) |
| `ignoreSheets` | シートレベルの除外 | スキーマ由来（渡しても無視） | [ignore](/docs/reference/config/ignore) |
| `map` | フィールド名のマッピング | スキーマ由来（渡しても無視） | [map](/docs/reference/config/map) |
| `mapSheets` | シート名のマッピング | スキーマ由来（渡しても無視） | [map](/docs/reference/config/map) |
| `autoincrement` | 自動採番 | スキーマ由来（渡しても無視） | [autoincrement](/docs/reference/config/autoincrement) |
| `lock` | `$transaction` と autoincrement で使うロック（既定は `LockService.getScriptLock()`） | 渡した値が有効 | [ロック](/docs/reference/transaction#ロック) |

### スキーマ由来のオプションはコンストラクタ引数を上書きします

生成された `GassmaClient` のコンストラクタは、`schema.prisma` から読み取った設定でオプションを上書きします。そのため上の表で「スキーマ由来」となっているオプションは、コンストラクタに渡しても**エラーにならず黙って無視されます**。これらの設定は `schema.prisma` に書いてください（[スキーマ](/docs/reference/schema)を参照）。

上書きはオプション単位で行われ、渡した値との**マージはされません**。例えば `defaults` はスキーマの `@default` から作られた設定で丸ごと置き換わるため、コンストラクタに渡した全モデル分の `defaults` がまとめて消えます。

```ts
const gassma = new GassmaClient({
  defaults: {
    User: { role: "guest" }, // 無視される（schema.prisma の @default が使われる）
  },
});
```

`id` / `omit` / `lock` は上書きされないため、渡した値がそのまま使われます。`id` を渡した場合は、スキーマに埋め込まれたスプレッドシート ID より優先されます。

上書きが起きるのは CLI が生成した `GassmaClient` だけです。CLI を使わず `new Gassma.GassmaClient()` を直接使う場合は、すべてのオプションが有効です（[GAS エディタでの利用](/docs/reference/gas-editor)）。

`strictUndefinedChecks` は生成されたクライアントのコンストラクタオプションにはありません。CLI を使う場合は `generator` ブロックの `previewFeatures` で有効化してください。有効化すると生成されたクライアントが自動で渡します（[strictUndefinedChecks / Gassma.skip](/docs/reference/config/strict-undefined-checks)）。

## Date 値の判定

GASsma は GAS ライブラリとして、呼び出し元スクリプトとは別のスクリプトコンテキストで動作します。そのため、GASsma が返した `Date` 値を `instanceof Date` で判定すると `false` になります。判定には `Object.prototype.toString` を使用してください。

```ts
const user = gassma.User.findFirst({ where: { id: 1 } });

user.createdAt instanceof Date;
// => false（ライブラリ境界を越えた Date は instanceof で判定できない）

Object.prototype.toString.call(user.createdAt) === "[object Date]";
// => true
```

この制約は `Date` などの**ビルトイン型**に対する `instanceof` の話です。GASsma が公開するエラークラス（`Gassma.GassmaMissingArgumentError` など）は `Gassma` 名前空間（ライブラリの global）経由で参照するため、`instanceof` で判定できます。詳しくは[エラー一覧](/docs/reference/errors)を参照してください。
