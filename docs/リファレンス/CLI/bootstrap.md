---
sidebar_position: 1
slug: /reference/bootstrap
description: "npx gassma bootstrap で clasp + esbuild + TypeScript + GASsma のローカル開発環境を一発でセットアップする"
---

# bootstrap（ローカル開発環境のセットアップ）

`npx gassma bootstrap` は、GAS のローカル開発環境（clasp + esbuild + TypeScript + GASsma ライブラリ）をコマンド一発で新規セットアップするコマンドです。

```
$ npx gassma bootstrap my-app   # my-app/ を作成してその中に構築
$ npx gassma bootstrap          # 最初に構築先ディレクトリを質問（デフォルト: gassma-project）
$ npx gassma bootstrap .        # カレントディレクトリに構築
```

`npx` で実行できるため、事前のインストールは不要です。実行すると対話形式で質問が進み、構築先ディレクトリの作成・Apps Script プロジェクトの作成からビルド設定・スキーマファイルの生成・依存パッケージのインストールまでが完了します。

:::note
構築先ディレクトリはコマンドが自動で作成するため、事前にディレクトリを用意する必要はありません。`.` を指定すれば既存のカレントディレクトリにも構築できます。既存ファイルがある場合は上書きせずスキップまたはマージされます（後述の「ディレクトリの扱い」「冪等性」を参照）。
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

### 1. Project directory?

プロジェクトを構築するディレクトリです。デフォルトは `gassma-project` で、`.` を入力するとカレントディレクトリに構築します。存在しないディレクトリは作成され、存在して空でない場合は続行確認が出ます（後述の「ディレクトリの扱い」を参照）。

:::note
コマンド引数でディレクトリを指定した場合（`npx gassma bootstrap my-app` や `npx gassma bootstrap .`）、この質問はスキップされます。
:::

### 2. Project title?

作成する Apps Script プロジェクトのタイトルです。デフォルトは構築先ディレクトリ名（引数または質問 1 で指定したディレクトリの名前）です。

### 3. Create a new spreadsheet as well?

**Yes**（デフォルト）にすると、新しいスプレッドシートを作成し、それに紐づくコンテナバインド型のスクリプトが作られます（`clasp create-script --type sheets`）。**No** の場合はスタンドアロン型（`--type standalone`）になります。

このあと `clasp create-script` が実行され、`.clasp.json` が生成されます（`rootDir` は `./dist`）。続けて `dist/appsscript.json` に GASsma ライブラリ依存などが自動設定されます（後述の「生成されるもの」を参照）。

:::note
既に `.clasp.json` が存在する場合、この質問と `clasp create-script` はスキップされます（`Found an existing .clasp.json. Skipping clasp create-script.`）。
:::

### 4. Function exposure style?

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

### 5. Linter and formatter setup?

リンタとフォーマッタの構成を選びます。

| 選択肢 | 説明 |
| --- | --- |
| `oxlint + oxfmt` | recommended（デフォルト） |
| `eslint + prettier` | ESLint（typescript-eslint）+ Prettier |
| `none` | リンタもフォーマッタも導入しない |

`--yes` 指定時はデフォルトの `oxlint + oxfmt` が選ばれます。選択に応じて `package.json` の devDependencies と `lint` / `lint:fix` / `format` / `format:check` スクリプト、生成される設定ファイルが変わります（後述の「リンタ / フォーマッタの選択」を参照）。

### 6. Generate a sample src/index.ts?

**Yes**（デフォルト）にすると、選んだスタイルのサンプルコードが `src/index.ts` として生成されます。

### 7. Install dependencies now?

**Yes**（デフォルト）にすると、検出されたパッケージマネージャで依存パッケージをインストールします（例: `Install dependencies now? (npm install)`）。`--skip-install` 指定時はこの質問自体が出ません。

## 生成されるもの

| ファイル | 内容 |
| --- | --- |
| `.clasp.json` | `clasp create-script` が生成（`rootDir: ./dist`） |
| `dist/appsscript.json` | GASsma ライブラリ依存・`timeZone`・`exceptionLogging: STACKDRIVER`・`runtimeVersion: V8` を自動設定 |
| `package.json` | `build` / `push` / `open` / `deploy` スクリプトと依存パッケージ（質問 5 の選択に応じて lint / format 系スクリプトも） |
| `esbuild.mjs` | 選んだスタイルに応じたビルド設定 |
| `tsconfig.json` | GAS 向けの TypeScript 設定（`@types/google-apps-script`） |
| `.gitignore` | `.clasp.json` / `.clasprc.json` / `.env` / `node_modules/` / `dist/*`（`dist/appsscript.json` を除く） |
| `.oxlintrc.json` | oxlint の設定（質問 5 で `oxlint + oxfmt` を選んだ場合のみ） |
| `eslint.config.mjs` / `.prettierrc` | ESLint / Prettier の設定（質問 5 で `eslint + prettier` を選んだ場合のみ） |
| `src/index.ts` | サンプルコード（質問 6 で Yes の場合のみ） |
| `AGENTS.md` | コーディングエージェント向けのプロジェクト案内（コマンド・開発フロー・制約と GASsma リファレンスへの導線） |
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
| `open` | `clasp open-script` |
| `deploy` | `npm run build && npm run push` |

質問 5 で `oxlint + oxfmt` または `eslint + prettier` を選んだ場合は、これに加えて `lint` / `lint:fix` / `format` / `format:check` が追加されます（内容は次節を参照）。

なお、新規生成される `package.json` の `devDependencies` はアルファベット順にソートされて書き出されます（フォーマッタのチェックがソート済みを前提とするため）。

### リンタ / フォーマッタの選択

質問 5 の選択によって、追加される devDependencies・npm スクリプト・設定ファイルが変わります。

#### oxlint + oxfmt（推奨）

devDependencies に `oxlint@^1.76.0` と `oxfmt@^0.61.0` が追加されます。

| スクリプト | 内容 |
| --- | --- |
| `lint` | `oxlint` |
| `lint:fix` | `oxlint --fix` |
| `format` | `oxfmt` |
| `format:check` | `oxfmt --check` |

`.oxlintrc.json` が生成されます。

```json
{
  "plugins": ["typescript"],
  "categories": { "correctness": "error" },
  "ignorePatterns": ["dist/**", "src/generated/**"]
}
```

#### eslint + prettier

devDependencies に `eslint@^10.8.0` / `eslint-config-prettier@^10.1.8` / `prettier@^3.9.6` / `typescript-eslint@^8.65.0` が追加されます。

| スクリプト | 内容 |
| --- | --- |
| `lint` | `eslint .` |
| `lint:fix` | `eslint . --fix` |
| `format` | `prettier --write .` |
| `format:check` | `prettier --check .` |

`eslint.config.mjs` と `.prettierrc` が生成されます。

```js
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist/**", "src/generated/**"]),
  {
    files: ["**/*.ts"],
    extends: [tseslint.configs.recommended, prettier],
  },
]);
```

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all"
}
```

#### none

devDependencies・スクリプト・設定ファイルのいずれも追加されません。

:::note
bootstrap が用意するのは上記までです。次のものは導入しません（必要な場合はプロジェクト側で追加してください）。

- pre-commit フック（husky / lint-staged など）
- oxlint の type-aware lint（`oxlint-tsgolint`）
- oxfmt の設定ファイル（デフォルト設定のまま使います）
:::

### .gitignore について

`.clasp.json` と `.clasprc.json` は clasp 公式の CI ガイドに従って gitignore されます（認証情報・スクリプト ID を含むため）。チームでプロジェクトを共有する場合は、チームのシークレットストアから復元してください。セットアップ完了時にも以下の案内が表示されます。

```
Note: .clasp.json is gitignored. Restore it from your team's secret store when sharing this project.
```

## 引数とオプション

| 引数 | 説明 |
| --- | --- |
| `[directory]` | プロジェクトを構築するディレクトリ（`.` でカレントディレクトリ）。省略時は対話で質問されます |

| オプション | 説明 |
| --- | --- |
| `--yes` | すべての質問にデフォルト値で回答（非対話モード）。引数なしの場合は `./gassma-project` を作成して構築し、非空ディレクトリの続行確認も自動で続行します |
| `--skip-install` | 依存パッケージのインストールをスキップ |
| `--dry-run` | ファイルの書き込み・ディレクトリの作成・コマンド実行を行わず、実行予定の内容のみ表示（ディレクトリ作成も `create directory my-app` のように plan として表示されます） |

:::note
対話できないターミナル（CI など）では `--yes` が必須です。指定がない場合は
`An interactive terminal is required. Run with --yes for non-interactive mode.`
と表示して終了します。
:::

## 挙動の詳細

### ディレクトリの扱い

- 指定したディレクトリが存在しない場合は作成し、その中に構築します。
- 存在して空でない場合は `Directory "my-app" is not empty. Continue?`（デフォルト **No**）と確認されます。No を選ぶと何も変更せず `Bootstrap cancelled.` と表示して安全に終了します。`--yes` 指定時は自動的に続行します。
- このため、途中で中断したセットアップは同じコマンドをもう一度実行し、続行確認に Yes と答えるだけで再開できます（生成済みのファイルは後述の「冪等性」によりスキップ/マージされます）。
- 同名の**ディレクトリでないファイル**が既に存在する場合は `"my-app" already exists and is not a directory.` というエラーで終了します。

### 冪等性

再実行しても安全なように設計されています。

- `.clasp.json` が存在する場合、`clasp create-script` はスキップされます。
- `esbuild.mjs` / `tsconfig.json` / `src/index.ts` / `gassma/schema.prisma` / `AGENTS.md` は、既に存在する場合スキップされます。
- リンタ / フォーマッタの設定ファイル（`.oxlintrc.json` / `eslint.config.mjs` / `.prettierrc`、質問 5 で選んだ場合に生成）も、既に存在する場合スキップされます。
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
4. `npm run open` で Apps Script エディタを開く

スキーマの書き方は[スキーマ](/docs/reference/schema)、`gassma generate` の詳細は [CLI コマンド](/docs/reference/cli/commands) を参照してください。
