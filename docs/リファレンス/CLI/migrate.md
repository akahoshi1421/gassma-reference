---
sidebar_position: 3
slug: /reference/migrate
description: "npx gassma migrate dev / migrate deploy / db push で、スキーマに合わせてスプレッドシートのシートと列を同期する GAS 関数を生成する"
---

# migrate / db push（シートの同期）

`npx gassma migrate` と `npx gassma db push` は、Prisma スキーマに合わせてスプレッドシートのシートと列を同期する GAS 関数を生成するコマンドです（Prisma の `prisma migrate dev` / `prisma migrate deploy` / `prisma db push` に相当）。

```
$ npx gassma migrate dev                  # スキーマから証跡（migrations/）を記録して生成
$ npx gassma migrate dev --name add_tags  # 証跡に名前を付ける
$ npx gassma migrate deploy               # 記録済みの最新の証跡をそのまま生成
$ npx gassma db push                      # 証跡を記録せずに生成
```

| コマンド | 動作 |
| --- | --- |
| `migrate dev` | スキーマから実行用スタブを生成し、証跡（`migrations/`）を記録します。削除がある場合は[確認](#削除の確認migrate-dev)を求めます |
| `migrate deploy` | 記録済みの最新の証跡を、そのまま実行用スタブとして出力します。スキーマを読まず、証跡も作らず、確認もしません |
| `db push` | スキーマから実行用スタブを生成します。証跡は記録しません |

引数なしの `npx gassma migrate` はヘルプを表示します。

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

どちらも無い場合は `MigrateOutputDirError` になります。3 つのコマンドで共通です。

### シートと列の抽出規則

`migrate dev` / `db push` がスキーマを読むときの規則です（`migrate deploy` はスキーマを読みません）。

- モデルごとに 1 シートが対象になります。`@@map` / `@map` を付けている場合はマッピング後の物理名が使われます。
- 列になるのはスカラーフィールドのみです。リレーションフィールド（上の例の `posts` / `author`）は列にならず、外部キー列（`authorId`）は列になります。
- `@ignore` / `@@ignore` の付いたフィールド・モデルも**作成対象に含まれます**。Prisma と同じく、クライアントから除外されるだけでスプレッドシート上には実体が存在するためです。
- [暗黙的 Many-to-Many](/docs/reference/schema#暗黙的-many-to-many) の中間シートも作成対象です（例: `_PostToTag`。列はモデル名のアルファベット順に `postId`, `tagId`）。

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

スタブに `acceptDataLoss: true` が埋め込まれていると、`gassmaMigrate` の実行時にスキーマに無い列・シートの削除まで行われます。

データが残っている列・シートは、残っている量（列は空でないセルの数、シートはデータ行数）を警告ログに出したうえで削除されます。空の場合は警告なしで削除されます。

```
Gassma.migrateSheets: You are about to drop the column "legacy" on the sheet "User", which still contains 12 non-empty values.
```

このフラグを立てる方法はコマンドごとに異なります。

| コマンド | 立て方 |
| --- | --- |
| `db push` | `--accept-data-loss` を付ける |
| `migrate dev` | 削除の[確認](#削除の確認migrate-dev)に `y` と答える |
| `migrate deploy` | 証跡に記録されている値がそのまま使われる |

### 消したくないシートを守る

削除したくないシートは、対応するモデルを**スキーマから消さずに `@@ignore` を付けて残して**ください。`@@ignore` の付いたモデルも[シートと列の抽出規則](#シートと列の抽出規則)のとおり作成対象一覧に残るため、`--accept-data-loss` を付けても削除されません。クライアントからは見えないまま、シートだけが守られます。

```prisma
model Memo {
  id      Int    @id
  content String

  @@map("メモ")
  @@ignore
}
```

列も同じで、`@ignore` を付けたフィールドは作成対象に残ります。モデル名に日本語は使えないため、シート名が日本語の場合は上の例のように `@@map` でマッピングしてください（[map](/docs/reference/config/map)）。

上の例のようにフィールドを書いた場合、そのシートの列も同期対象になります。スキーマに書いていない列は `--accept-data-loss` で削除されるため、守られるのはシートと、スキーマに書いた列です。

列も丸ごと守りたい場合は、フィールドを 1 つも書かないモデルにしてください。Prisma のスキーマとしては有効で、GASsma はそのシートの列を 1 つも管理しなくなります。`--accept-data-loss` を付けても列の追加・削除は行われず、「スキーマに無い列」の警告も出ません。

```prisma
model Memo {
  @@map("メモ")
  @@ignore
}
```

```
Gassma.migrateSheets: model "メモ" declares no columns. The columns of sheet "メモ" are left untouched.
```

シートがまだ無い場合は、フィールドを書いた場合と同じように作成されます（列が 0 個なのでヘッダー行は書き込まれません）。

:::note
逆にモデルごとスキーマから消すと、そのシートは「スキーマに無いシート」になります。`--accept-data-loss` を付けていなければ警告が出るだけで残りますが、付けていれば削除されます。
:::

## 削除の確認（migrate dev）

`migrate dev` は、**前回の証跡と今回のスキーマを比べて**消えたシート・消えた列があれば、生成前に確認を求めます。

```

⚠️ The following are recorded in gassma/migrations but are no longer in your schema:
    • sheet "Legacy"
    • column "nickname" in sheet "User"
  Generating this migration deletes them together with every value they hold.
  This is based on the recorded migrations, not on the spreadsheet itself:
  sheets and columns changed by "gassma db push" or by hand are not reflected here.

Continue? (y/N)
```

- `y` / `yes`（大文字小文字は問いません）と答えると、削除するスタブ（`acceptDataLoss: true`）を生成し、証跡を記録します。
- それ以外（そのまま Enter を含む）と答えると**中止**します。スタブも証跡も書かれません。

```
Aborted. gassma-migration.js and the migration were not written.
```

- 消えたシート・列が 1 つも無ければ確認は行われず、削除しないスタブになります。証跡がまだ 1 つも無い場合（初回）も確認は行われません。
- 非対話環境（CI など）で削除がある場合は、確認できないため `MigrateConfirmationRequiredError` で中止します。記録済みの証跡をそのまま流したい場合は `migrate deploy` を使ってください。

:::caution
この確認は **`migrations/` に記録された証跡との比較**であって、実際のスプレッドシートを見たものではありません。間に `db push` を挟んだり、シートを手で編集したりすると、証跡と実際のシートはずれます。表示された一覧は「前回の `migrate dev` 以降にスキーマから消えたもの」だと考えてください。
:::

:::note
最新の証跡が読み取れなかった場合は、削除の検査ができない旨を警告したうえで、削除しないスタブが生成されます。
:::

## 証跡（migrations/）

`migrate dev` は、スキーマと同じディレクトリの `migrations/` 配下に `<UTC タイムスタンプ>[_名前]/migration.js` を作成します。中身は実行用スタブと同一です。

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
- スキーマが変わっていない状態で `migrate dev` を実行し直した場合、証跡に記録されている `acceptDataLoss` がそのまま使われます。一度 `y` と答えた削除の判断が、再実行で取り消されることはありません。
- `--name` で証跡に名前を付けられます。名前は camelCase の分解 → 小文字化 → 英数字以外の連続を `_` に置換、の規則でサニタイズされます（例: `--name "Add UserRole!"` → `20260801120000_add_user_role`）。

### migrate deploy

`migrate deploy` は、`migrations/` の最新の証跡をそのまま実行用スタブとして書き出します。スキーマを読まないため、スキーマを編集していても出力は変わりません。

```
$ npx gassma migrate deploy
📄 Using gassma/migrations/20260802093000_add_tags/migration.js
📄 Wrote dist/gassma-migration.js

✅ Latest recorded migration prepared
```

証跡に埋め込まれた `acceptDataLoss` もそのまま再生されるため、`dev` のときに下した削除の判断がそのまま実行されます。CI が削除を勝手に判断することはありません。

証跡が 1 つも無い場合は `NoMigrationTrailError` になります。先に `migrate dev` を実行してください。

## オプション

### migrate dev

| オプション | 説明 |
| --- | --- |
| `--name <name>` | マイグレーションの名前 |
| `--output <dir>` | `gassma-migration.js` の出力先ディレクトリ（デフォルトは `.clasp.json` の `rootDir`） |
| `--schema <path>` | マイグレーション対象の `.prisma` ファイルのパス |
| `--config <path>` | GASsma config ファイルのカスタムパス |

### migrate deploy

| オプション | 説明 |
| --- | --- |
| `--output <dir>` | `gassma-migration.js` の出力先ディレクトリ（デフォルトは `.clasp.json` の `rootDir`） |
| `--config <path>` | GASsma config ファイルのカスタムパス |

### db push

| オプション | 説明 |
| --- | --- |
| `--output <dir>` | `gassma-migration.js` の出力先ディレクトリ（デフォルトは `.clasp.json` の `rootDir`） |
| `--schema <path>` | 同期対象の `.prisma` ファイルのパス |
| `--config <path>` | GASsma config ファイルのカスタムパス |
| `--accept-data-loss` | スキーマに無いシート・列を削除 |

## 制限事項

- ヘッダー行は各シートの **1 行目・A 列開始**が前提です。[changeSettings](/docs/reference/settings/changeSettings) でヘッダー位置を変更している場合には対応していません。
- スプレッドシートには最低 1 枚のシートが必要なため、`acceptDataLoss: true` でも最後の 1 枚は削除されず、警告のみになります。

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
