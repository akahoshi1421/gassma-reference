---
sidebar_position: 4
slug: /reference/gas-editor
description: "CLI を使わず GAS スクリプトエディタだけで GASsma を使う方法。Gassma.GassmaClient の初期化とコンストラクタオプション一覧"
---

# GAS エディタでの利用

GASsma は CLI を使わず、GAS のスクリプトエディタだけでも使えます。ライブラリを追加すればすぐに書き始められるため、小さなスクリプトや、ローカル環境を用意せずに試したい場合に向いています。

このページでは、GAS エディタだけで使う場合の書き方をまとめます。CLI を使う場合の書き方は[基本](/docs/reference/basic)を参照してください。

:::note
どちらの使い方も同じライブラリの同じ機能を使います。違いは**設定をどこに書くか**だけです。CLI を使う場合は `schema.prisma` に書き、GAS エディタだけで使う場合はコンストラクタの引数に書きます。
:::

## ライブラリの追加

スクリプト ID `1ZVuWMUYs4hVKDCcP3nVw74AY48VqLm50wRceKIQLFKL0wf4Hyou-FIBH` をライブラリとして追加します。手順は[導入方法](/docs/installation)を参照してください。

追加すると、グローバルの `Gassma` 名前空間からクライアントを生成できるようになります。

## インスタンス生成

スプレッドシートに紐づいた GAS（コンテナバインド型）であれば、引数なしでインスタンスを生成できます。

```ts
const gassma = new Gassma.GassmaClient();
```

スプレッドシートではない場所に GAS を作成した場合や、別のスプレッドシートを扱う場合は、対象のスプレッドシート ID を渡します。

```ts
const gassma = new Gassma.GassmaClient("XXXXXXXXXXXXXXXXXXX");
```

### オプションオブジェクトでの初期化

リレーション定義やグローバル omit など、設定を伴う場合はオプションオブジェクトを渡します。

```ts
const gassma = new Gassma.GassmaClient({
  id: "XXXXXXXXXXXXXXXXXXX", // 省略可
  relations: {
    Users: {
      posts: { type: "oneToMany", to: "Posts", field: "id", reference: "authorId" },
    },
  },
  omit: {
    Users: { password: true },
  },
});
```

## コンストラクタオプション一覧

| オプション | 説明 | 参照 |
| --- | --- | --- |
| `id` | スプレッドシート ID（省略時はアクティブスプレッドシート） | - |
| `relations` | リレーション定義 | [リレーション定義](/docs/reference/relation/definition) |
| `omit` | グローバル omit 設定 | [グローバル omit](/docs/reference/config/global-omit) |
| `defaults` | フィールドのデフォルト値 | [defaults](/docs/reference/config/defaults) |
| `updatedAt` | 自動更新タイムスタンプ | [updatedAt](/docs/reference/config/updated-at) |
| `ignore` | フィールドレベルの除外 | [ignore](/docs/reference/config/ignore) |
| `ignoreSheets` | シートレベルの除外 | [ignore](/docs/reference/config/ignore) |
| `map` | フィールド名のマッピング | [map](/docs/reference/config/map) |
| `mapSheets` | シート名のマッピング | [map](/docs/reference/config/map) |
| `autoincrement` | 自動採番 | [autoincrement](/docs/reference/config/autoincrement) |
| `strictUndefinedChecks` | クエリ入力の明示的な `undefined` を実行時エラーにする | [strictUndefinedChecks / Gassma.skip](/docs/reference/config/strict-undefined-checks) |

## スキーマ版との対応

CLI を使う場合、上記のオプションの多くは `schema.prisma` の属性として書きます。

| コンストラクタオプション | スキーマでの書き方 |
| --- | --- |
| `relations` | `@relation(fields: [...], references: [...])` |
| `defaults` | `@default(...)` |
| `autoincrement` | `@default(autoincrement())` |
| `updatedAt` | `@updatedAt` |
| `ignore` | `@ignore` |
| `ignoreSheets` | `@@ignore` |
| `map` | `@map("...")` |
| `mapSheets` | `@@map("...")` |
| `strictUndefinedChecks` | `previewFeatures = ["strictUndefinedChecks"]` |
| `omit` | スキーマ側の書き方はありません（CLI を使う場合もコンストラクタで指定します） |
| `id` | `datasource` ブロックの `url`、または `gassma.config.ts` の `datasource.url` |

各設定の詳細は[スキーマ](/docs/reference/schema)を参照してください。

## 型について

GAS エディタでは型定義が生成されないため、シート名・カラム名の補完や型チェックは効きません。シート名やカラム名の誤りは実行時に判明します。

型安全に開発したい場合は CLI の利用を検討してください（[クイックスタート](/docs/quickstart)）。

## エラークラスの参照

GASsma が投げるエラークラスは `Gassma` 名前空間から参照できます。

```ts
try {
  gassma.Users.findFirstOrThrow({ where: { id: 999 } });
} catch (e) {
  if (e instanceof Gassma.NotFoundError) {
    console.log("見つかりませんでした");
  }
}
```

エラークラスの一覧は[エラー一覧](/docs/reference/errors)を参照してください。

:::note
`Date` などのビルトイン型は、ライブラリ境界をまたぐと `instanceof` で判定できません。詳しくは[基本](/docs/reference/basic#date-値の判定)を参照してください。
:::
