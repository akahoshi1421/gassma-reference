---
sidebar_position: 6
slug: /reference/migrate
description: "npx gassma migrate / npx gassma db push で、スキーマに合わせてスプレッドシートのシートと列を同期する GAS 関数を生成する"
---

# migrate / db push（シートの同期）

`npx gassma migrate` と `npx gassma db push` は、Prisma スキーマに合わせてスプレッドシートのシートと列を同期する GAS 関数を生成するコマンドです（Prisma の `prisma migrate dev` / `prisma db push` に相当）。

```
$ npx gassma migrate                  # 証跡（migrations/）を記録して生成
$ npx gassma migrate --name add_tags  # 証跡に名前を付ける
$ npx gassma db push                  # 証跡を記録せずに生成
```

2 つのコマンドの違いは**証跡（`migrations/` ディレクトリ）を記録するかどうかだけ**です。`migrate` はスキーマが変わるたびに `migrations/` 配下へ `migration.js` を残し、`db push` は `migrations/` に一切触れません。生成される実行用スタブの内容はどちらも同一です。マイグレーション履歴が不要な場合は `db push` を使ってください。

:::note
コマンド自体はスプレッドシートに直接アクセスしません。生成された `gassmaMigrate` 関数を Apps Script 側で 1 回実行した時点でシートが同期されます。`clasp push` も自動実行されません（後述の「生成後の手順」を参照）。
:::

## 生成されるもの

出力ディレクトリに実行用スタブ `gassma-migration.js`（生の JS）が生成されます。中身は GASsma ライブラリの `migrateSheets` を呼ぶ `gassmaMigrate` 関数 1 つで、スキーマから抽出したシート名と列名が埋め込まれています。

```prisma
model User {
  id    Int    @id
  name  String
  posts Post[]
}

model Post {
  id       Int    @id
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int
}
```

上記のスキーマからは以下が生成されます。

```js
function gassmaMigrate() {
  Gassma.migrateSheets({
    spreadsheetId: "XXXXX",
    models: [
      { name: "User", columns: ["id", "name"] },
      { name: "Post", columns: ["id", "title", "authorId"] }
    ]
  });
}
```

- スプレッドシート ID は、スキーマ内の `datasource` ブロック → `gassma.config.ts` の `datasource.url` の順で解決されます。どちらにも設定が無い場合は埋め込まれず、実行時にスクリプトにバインドされたスプレッドシートが対象になります。
- 実行には GAS プロジェクトに GASsma ライブラリが登録されている必要があります（[bootstrap](/docs/reference/bootstrap) でセットアップした環境ならそのまま動きます）。呼び出しシンボル（例の `Gassma.` の部分）は、出力ディレクトリの `appsscript.json` に登録されたライブラリの `userSymbol` から自動解決されます（見つからない場合は `Gassma`）。

### 出力先の解決

1. `--output <dir>`（最優先）
2. カレントディレクトリの `.clasp.json` の `rootDir`

どちらも無い場合は `MigrateOutputDirError` になります。

### シートと列の抽出規則

- モデルごとに 1 シートが対象になります。`@@map` / `@map` を付けている場合はマッピング後の物理名が使われます。
- 列になるのはスカラーフィールドのみです。リレーションフィールド（上の例の `posts` / `author`）は列にならず、外部キー列（`authorId`）は列になります。
- `@ignore` / `@@ignore` の付いたフィールド・モデルも**作成対象に含まれます**。Prisma と同じく、クライアントから除外されるだけでスプレッドシート上には実体が存在するためです。
- [暗黙的 Many-to-Many](/docs/reference/type-generation#暗黙的-many-to-many) の中間シートも作成対象です（例: `_PostToTag`。列はモデル名のアルファベット順に `postId`, `tagId`）。

## 生成後の手順

コマンド成功時に表示される Next steps の 2 ステップを実行すると、シートが同期されます。

```
✅ Migration generated

Next steps:
  1. Run "clasp push" (or "npm run push") to upload gassma-migration.js
  2. In the Apps Script editor, run the "gassmaMigrate" function once
```

:::note
push には `clasp push`（または `clasp push` を呼ぶだけの `npm run push`）を直接使ってください。クリーンを伴うフルビルド（bootstrap が生成する `npm run deploy` など）は、push 前に出力ディレクトリごと `gassma-migration.js` を消してしまうことがあります。
:::

## 同期の規則

`gassmaMigrate`（`Gassma.migrateSheets`）による同期は冪等で、何度実行しても安全です。

- スキーマにあってスプレッドシートに無いシートを作成し、1 行目にヘッダーを書き込みます。
- 既存シートには足りない列だけをヘッダー行の右端に追記します。**既存列の並べ替えは行わず**、データ行への書き込みもありません。
- スキーマに無い列・シートは、デフォルトでは削除されず警告ログを出してそのまま残されます。

```
Gassma.migrateSheets: column "legacy" on sheet "User" is not in the schema. It is left untouched.
```

## データ削除（--accept-data-loss）

スキーマに無い列・シートを削除したい場合は `--accept-data-loss` を付けます。スタブに `acceptDataLoss: true` が埋め込まれ、`gassmaMigrate` の実行時に削除まで行われます。

データが残っている列・シートは、残っている量（列は空でないセルの数、シートはデータ行数）を警告ログに出したうえで削除されます。空の場合は警告なしで削除されます。

```
Gassma.migrateSheets: You are about to drop the column "legacy" on the sheet "User", which still contains 12 non-empty values.
```

## 証跡（migrations/）

`migrate` は、スキーマと同じディレクトリの `migrations/` 配下に `<UTC タイムスタンプ>[_名前]/migration.js` を作成します。中身は実行用スタブと同一です。

```
gassma/
├── schema.prisma
└── migrations/
    ├── 20260801120000_init/
    │   └── migration.js
    └── 20260802093000_add_tags/
        └── migration.js
```

- 直近の証跡と内容が同じ場合、新しい証跡は作られません（`Already in sync, no schema change or pending migration was found.` と表示されます）。実行用スタブ自体は毎回書き直されます。
- `--name` で証跡に名前を付けられます。名前は camelCase の分解 → 小文字化 → 英数字以外の連続を `_` に置換、の規則でサニタイズされます（例: `--name "Add UserRole!"` → `20260801120000_add_user_role`）。

## オプション

### migrate

| オプション | 説明 |
| --- | --- |
| `--name <name>` | マイグレーションの名前 |
| `--output <dir>` | `gassma-migration.js` の出力先ディレクトリ（デフォルトは `.clasp.json` の `rootDir`） |
| `--schema <path>` | マイグレーション対象の `.prisma` ファイルのパス |
| `--config <path>` | GASsma config ファイルのカスタムパス |
| `--accept-data-loss` | スキーマに無いシート・列を削除 |

### db push

| オプション | 説明 |
| --- | --- |
| `--output <dir>` | `gassma-migration.js` の出力先ディレクトリ（デフォルトは `.clasp.json` の `rootDir`） |
| `--schema <path>` | 同期対象の `.prisma` ファイルのパス |
| `--config <path>` | GASsma config ファイルのカスタムパス |
| `--accept-data-loss` | スキーマに無いシート・列を削除 |

## 制限事項

- ヘッダー行は各シートの **1 行目・A 列開始**が前提です。[changeSettings](/docs/reference/settings/changeSettings) でヘッダー位置を変更している場合には対応していません。
- スプレッドシートには最低 1 枚のシートが必要なため、`--accept-data-loss` を付けても最後の 1 枚は削除されず、警告のみになります。

## Gassma.migrateSheets（ライブラリ API）

スタブが呼んでいる `Gassma.migrateSheets` は GASsma の公開 API です。CLI を使わずに、同期したいシートと列を直接指定して呼ぶこともできます。

```ts
Gassma.migrateSheets({
  spreadsheetId: "SPREAD_SHEET_ID", // 省略時はバインドされたスプレッドシート
  models: [{ name: "User", columns: ["id", "name"] }],
  acceptDataLoss: false,
});
```

`models` は必須で、省略すると `GassmaMissingArgumentError` になります。同期の規則・制限事項は CLI 経由の場合と同じです。
