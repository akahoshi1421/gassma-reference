---
sidebar_position: 2
slug: /reference/cli/commands
description: "gassma CLI のコマンド一覧（generate / init / validate / format / studio / version）と、生成されるファイル・型の概要"
---

# CLI コマンド

`gassma` パッケージをインストールすると、`npx gassma <command>` で CLI を実行できます。

```
$ npm i gassma
```

| コマンド | 説明 |
| --- | --- |
| [`bootstrap`](/docs/reference/bootstrap) | ローカル開発環境（clasp + esbuild + TypeScript + GASsma）を一発でセットアップ |
| [`init`](#gassma-init) | スキーマファイルと設定ファイルを生成 |
| [`generate`](#gassma-generate) | スキーマから型ファイルとクライアントコードを生成 |
| [`migrate` / `db push`](/docs/reference/migrate) | スキーマに合わせてシートと列を同期する GAS 関数を生成 |
| [`validate`](#gassma-validate) | スキーマファイルの構文・整合性チェック |
| [`format`](#gassma-format) | `.prisma` ファイルを整形 |
| [`studio`](#gassma-studio) | 対象のスプレッドシートをブラウザで開く |
| [`version`](#gassma-version) | CLI のバージョンを表示 |

## gassma generate

型ファイルとクライアントコードを生成します。

```
$ npx gassma generate
```

デフォルトでは `./gassma` ディレクトリ内の `.prisma` ファイルが探索されます。`--schema` オプションで特定のスキーマファイルまたはディレクトリを指定できます（Prisma の `prisma generate --schema` に相当）。

```
$ npx gassma generate --schema gassma/user.prisma
$ npx gassma generate --schema ./schemas
```

`--watch` オプションでスキーマファイルの変更を監視し、自動で再生成できます。

```
$ npx gassma generate --watch
```

`--schema` との併用も可能です。

`--config` オプションで設定ファイルのパスを明示的に指定できます（Prisma の `--config` に相当）。

```
$ npx gassma generate --config configs/gassma.config.ts
```

指定したファイルが存在しない場合は `ConfigFileNotFoundError` になります。未指定時はデフォルトの場所が探索されます（[設定ファイル](/docs/reference/cli/config)の「設定ファイルの探索規則」を参照）。

### 生成されるファイル

スキーマファイル名をもとに以下のファイルが生成されます。例えば `schema.prisma` の場合:

| ファイル | 内容 |
| --- | --- |
| `schema.d.ts` | 型定義（モデル型、クエリ型、共通型） |
| `schemaClient.js` | クライアント実装（リレーション定義の自動注入込み） |
| `schemaClient.d.ts` | クライアントの型定義 |

出力先は `generator` ブロックの `output` で指定したディレクトリです。

### 生成される型の概要

生成される `.d.ts` には以下の型が含まれます。

- **モデル型**: 各フィールドの型定義（`GassmaUserUse` 等）
- **クエリ型**: `FindData`、`CreateData`、`UpdateData`、`DeleteData`、`UpsertData` 等
- **Select / Omit 型**: フィールド選択・除外の型
- **フィルタ型**: `WhereUse`、`FilterConditions`（`FieldRef` 対応含む）
- **OrderBy 型**: ソート条件（リレーションソート、`_count` ソート、nulls 制御含む）
- **Include 型**: リレーション取得の型（`_count` 含む）
- **Nested Write 型**: リレーション先の作成・接続・更新・削除操作
- **数値操作型**: `NumberOperation`（increment / decrement / multiply / divide）
- **共通型**: `FieldRef`、`GassmaClientOptions`、エラークラス群
- **設定型**: `DefaultsConfig`、`UpdatedAtConfig`、`IgnoreConfig`、`AutoincrementConfig`、`MapConfig` 等
- **コントローラー型**: 全メソッドの引数・戻り値型

生成されたクライアントの使い方は[基本](/docs/reference/basic)を参照してください。

## gassma init

プロジェクトを初期化し、スキーマファイルと設定ファイルを自動生成します。

```
$ npx gassma init
```

以下のファイルが生成されます:

- `gassma/schema.prisma` — 初期スキーマ
- `gassma.config.ts` — 設定ファイル

| オプション | 説明 |
| --- | --- |
| `--output <path>` | 生成先パスをカスタマイズ |
| `--with-model` | サンプル User モデルを含むスキーマを生成 |

既に `schema.prisma` が存在する場合はエラーで安全に停止します。

:::note
新規プロジェクトを始める場合は、`init` の内容に加えて clasp・esbuild・TypeScript の設定までまとめて用意する [`gassma bootstrap`](/docs/reference/bootstrap) が便利です。
:::

## gassma validate

スキーマファイルの構文チェック・整合性チェックを行います（Prisma の `prisma validate` に相当）。

```
$ npx gassma validate
```

```
$ npx gassma validate --schema gassma/test.prisma
```

`--config` オプションで設定ファイルのパスを指定することもできます。

チェック項目:

- 構文エラー（パーサーエラー検出）
- `generator` ブロックの存在チェック
- `output` フィールドの必須チェック
- モデルが 1 つ以上定義されていること

成功時は以下のように出力されます:

```
The schema at /path/to/gassma/test.prisma is valid 🚀
```

## gassma format

`.prisma` ファイルを Prisma 公式と同じフォーマットで整形します（`@prisma/internals` の `formatSchema` を使用）。

```
$ npx gassma format
```

| オプション | 説明 |
| --- | --- |
| `--schema <path>` | 特定ファイルのみ整形 |
| `--config <path>` | 設定ファイルのパスを指定 |
| `--check` | フォーマット済みかチェック（CI 用、未整形時は exit 1） |

## gassma studio

`datasource` に設定したスプレッドシートを、OS のデフォルトブラウザで開きます。

```
$ npx gassma studio
```

| オプション | 説明 |
| --- | --- |
| `--config <path>` | 設定ファイルのパスを指定 |

URL は以下の順で解決されます。

1. スキーマ内の `datasource` ブロックの `url`
2. `gassma.config.ts` の `datasource.url`

`url` にフル URL（`https://...`）を指定している場合はそのまま開き、スプレッドシート ID を指定している場合は `https://docs.google.com/spreadsheets/d/<id>/edit` を組み立てて開きます。どちらにも URL が設定されていない場合は `NoDatasourceUrlError` になります。

## gassma version

GASsma CLI のバージョンを表示します。

```
$ npx gassma version
```

`--version` / `-V` フラグでも確認できます。

| オプション | 説明 |
| --- | --- |
| `--json` | バージョン情報を JSON で出力 |

`--json` を付けると、バージョン情報を JSON 形式（`{"gassma":"<version>"}`）で出力します。

```
$ npx gassma version --json
{"gassma":"1.2.3"}
```
