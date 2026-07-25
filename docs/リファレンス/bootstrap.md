---
sidebar_position: 6
slug: /reference/bootstrap
description: "npx gassma bootstrap で clasp + esbuild + TypeScript + GASsma のローカル開発環境を一発でセットアップする"
---

# bootstrap（ローカル開発環境のセットアップ）

`npx gassma bootstrap` は、GAS のローカル開発環境（clasp + esbuild + TypeScript + GASsma ライブラリ）をコマンド一発で新規セットアップするコマンドです。

```
$ npx gassma bootstrap
```

`npx` で実行できるため、事前のインストールは不要です。実行すると対話形式で質問が進み、Apps Script プロジェクトの作成からビルド設定・スキーマファイルの生成・依存パッケージのインストールまでが完了します。

:::note
このコマンドは**新規プロジェクト専用**です。空のディレクトリで実行することを想定しています（既存ファイルがある場合は上書きせずスキップまたはマージされます。後述の「冪等性」を参照）。
:::

## 前提

[clasp](https://github.com/google/clasp) がインストール済みで、ログインが済んでいる必要があります。

```
$ npm install -g @google/clasp
$ clasp login
```

また、[Apps Script API の設定ページ](https://script.google.com/home/usersettings) で Apps Script API を有効にしておいてください（clasp がプロジェクトを作成するために必要です）。

clasp が見つからない場合は、以下のメッセージを表示して安全に終了します（ファイルは一切変更されません）。

```
clasp is required but was not found in your PATH.
Install it with: npm install -g @google/clasp
Then log in with: clasp login
```

## 対話フロー

以下の順で質問されます（プロンプトは実際の文言です）。

### 1. Project title?

作成する Apps Script プロジェクトのタイトルです。デフォルトはカレントディレクトリ名です。

### 2. Create a new spreadsheet as well?

**Yes**（デフォルト）にすると、新しいスプレッドシートを作成し、それに紐づくコンテナバインド型のスクリプトが作られます（`clasp create-script --type sheets`）。**No** の場合はスタンドアロン型（`--type standalone`）になります。

このあと `clasp create-script` が実行され、`.clasp.json` が生成されます（`rootDir` は `./dist`）。続けて `dist/appsscript.json` に GASsma ライブラリ依存などが自動設定されます（後述の「生成されるもの」を参照）。

:::note
既に `.clasp.json` が存在する場合、この質問と `clasp create-script` はスキップされます（`Found an existing .clasp.json. Skipping clasp create-script.`）。
:::

### 3. Function exposure style?

GAS に関数を露出させるスタイルを選びます。選択肢の前に、それぞれのサンプルコードが表示されます。

**export（推奨）** — `@gassma/gas-esbuild-plugin` を使い、`export` した関数がそのまま GAS のグローバル関数になります。

```ts
export const main = () => console.log("Hello GAS!");
```

**global**（esbuild-gas-plugin style） — `esbuild-gas-plugin` を使い、`global` オブジェクトへの代入で関数を露出します。

```ts
const main = () => console.log("Hello GAS!");

interface Global {
  main: typeof main;
}

declare const global: Global;

global.main = main;
```

選んだスタイルに応じて、生成される `esbuild.mjs` のプラグインと `package.json` の devDependencies が切り替わります。

### 4. Generate a sample src/index.ts?

**Yes**（デフォルト）にすると、選んだスタイルのサンプルコードが `src/index.ts` として生成されます。

### 5. Install dependencies now?

**Yes**（デフォルト）にすると、検出されたパッケージマネージャで依存パッケージをインストールします（例: `Install dependencies now? (npm install)`）。`--skip-install` 指定時はこの質問自体が出ません。

## 生成されるもの

| ファイル | 内容 |
| --- | --- |
| `.clasp.json` | `clasp create-script` が生成（`rootDir: ./dist`） |
| `dist/appsscript.json` | GASsma ライブラリ依存・`timeZone`・`exceptionLogging: STACKDRIVER`・`runtimeVersion: V8` を自動設定 |
| `package.json` | `build` / `push` / `open` / `deploy` スクリプトと依存パッケージ |
| `esbuild.mjs` | 選んだスタイルに応じたビルド設定 |
| `tsconfig.json` | GAS 向けの TypeScript 設定（`@types/google-apps-script`） |
| `.gitignore` | `.clasp.json` / `.clasprc.json` / `.env` / `node_modules/` / `dist/*`（`dist/appsscript.json` を除く） |
| `src/index.ts` | サンプルコード（質問 4 で Yes の場合のみ） |
| `gassma/schema.prisma` / `gassma.config.ts` | `gassma init` 相当（サンプル User モデル入りのスキーマと設定ファイル） |

### dist/appsscript.json

`timeZone` は実行環境から自動判定されます（判定できない場合は `America/New_York`）。GASsma ライブラリは以下のエントリとして追加されます。

```json
{
  "userSymbol": "Gassma",
  "libraryId": "1ZVuWMUYs4hVKDCcP3nVw74AY48VqLm50wRceKIQLFKL0wf4Hyou-FIBH",
  "version": "<実行時に解決された最新バージョン>",
  "developmentMode": false
}
```

既存のマニフェストに `exceptionLogging` や `runtimeVersion` が設定されている場合はその値が保持されます。

### package.json のスクリプト

| スクリプト | 内容 |
| --- | --- |
| `build` | `node esbuild.mjs`（`src/index.ts` を `dist/index.js` にバンドル） |
| `push` | `clasp push` |
| `open` | `clasp open` |
| `deploy` | `npm run build && npm run push` |

### .gitignore について

`.clasp.json` と `.clasprc.json` は clasp 公式の CI ガイドに従って gitignore されます（認証情報・スクリプト ID を含むため）。チームでプロジェクトを共有する場合は、チームのシークレットストアから復元してください。セットアップ完了時にも以下の案内が表示されます。

```
Note: .clasp.json is gitignored. Restore it from your team's secret store when sharing this project.
```

## オプション

| オプション | 説明 |
| --- | --- |
| `--yes` | すべての質問にデフォルト値で回答（非対話モード） |
| `--skip-install` | 依存パッケージのインストールをスキップ |
| `--dry-run` | ファイルの書き込みやコマンド実行を行わず、実行予定の内容のみ表示 |

:::note
対話できないターミナル（CI など）では `--yes` が必須です。指定がない場合は
`An interactive terminal is required. Run with --yes for non-interactive mode.`
と表示して終了します。
:::

## 挙動の詳細

### 冪等性

再実行しても安全なように設計されています。

- `.clasp.json` が存在する場合、`clasp create-script` はスキップされます。
- `esbuild.mjs` / `tsconfig.json` / `src/index.ts` / `gassma/schema.prisma` は、既に存在する場合スキップされます。
- `package.json` が既に存在する場合は、bootstrap の設定が**マージ**されます（既存の値が優先されます）。
- `.gitignore` が既に存在する場合は、不足しているエントリのみ追記されます。
- `dist/appsscript.json` に GASsma ライブラリのエントリが既にある場合は、重複追加されません。

### GASsma ライブラリバージョンの解決

`dist/appsscript.json` に設定する GASsma ライブラリの最新バージョンは、実行時に自動解決されます。

1. `clasp list-versions` でライブラリの最新バージョン番号を取得
2. 失敗した場合は GitHub 上の GASsma の `package.json` から取得

両方失敗した場合（オフライン時など）は、ライブラリのエントリ追加をスキップし、Apps Script エディタでの手動追加手順（スクリプト ID を含む）が案内されます。オンライン状態で `gassma bootstrap` を再実行すれば、エントリは自動追加されます。

### パッケージマネージャの自動検出

npm / pnpm / yarn / bun を自動検出し（検出できない場合は npm）、インストールコマンドや完了時の案内メッセージに反映されます。

## セットアップ後の次の一歩

セットアップが完了すると、次の手順が表示されます。

1. `gassma/schema.prisma` を編集してモデルを定義する
2. `npx gassma generate` で型付きクライアントを生成する
3. `npm run deploy` でビルドして Apps Script に push する
4. `npx clasp open` で Apps Script エディタを開く

スキーマの書き方や `gassma generate` の詳細は [Prisma スキーマを利用したローカル開発](/docs/reference/type-generation) を参照してください。
