// llms.txt の「薄い手書き層」。セクション構成・ヘッダ文・Optional リンクのみをここで管理し、
// ページの列挙・並び順・説明はビルド時に sidebars と frontmatter から自動生成する。

export type SectionDef = {
  title: string;
  routes: string[];
};

export const SECTIONS: SectionDef[] = [
  {
    title: "Getting Started",
    routes: ["/docs/intro", "/docs/installation", "/docs/reference/basic"],
  },
  { title: "Reading Data", routes: ["/docs/reference/crud/read"] },
  { title: "Writing Data", routes: ["/docs/reference/crud"] },
  { title: "Aggregation", routes: ["/docs/reference/statistics"] },
  { title: "Relations", routes: ["/docs/reference/relation"] },
  {
    title: "Configuration",
    routes: ["/docs/reference/config", "/docs/reference/settings"],
  },
  { title: "Advanced", routes: ["/docs/reference"] },
];

export const EXCLUDED_SOURCE_SUFFIXES = ["/llms.txt.md"];

const GAS_SCRIPT_ID =
  "1ZVuWMUYs4hVKDCcP3nVw74AY48VqLm50wRceKIQLFKL0wf4Hyou-FIBH";

export const buildHeader = (
  locale: string,
  origin: string,
  rootBase: string
): string => {
  const jaLlms = `${origin}${rootBase}llms.txt`;
  const enLlms = `${origin}${rootBase}en/llms.txt`;

  if (locale === "en") {
    return `# GASsma

> GASsma is a Google Apps Script (GAS) library that lets you operate Google Sheets like a database with a Prisma-like, type-safe API. It provides CRUD operations, filtering, sorting, pagination, aggregation, relations, and nested writes on spreadsheet data.

Install with \`npm i gassma\` for local development (clasp + bundler), or add it as a GAS library with Script ID \`${GAS_SCRIPT_ID}\`.

The links below point to the Markdown version of each page (page URL + \`.md\`); remove the \`.md\` suffix for the HTML version. The Japanese index is available at ${jaLlms} (replace \`/en/docs/\` with \`/docs/\` in any URL for the Japanese page).
`;
  }

  return `# GASsma

> GASsma は、Google スプレッドシートを Prisma ライクな型安全 API でデータベースのように操作できる Google Apps Script (GAS) ライブラリです。CRUD 操作・フィルタリング・ソート・ページネーション・集計・リレーション・ネストされた書き込みに対応しています。

ローカル開発では \`npm i gassma\`（clasp + バンドラ構成）でインストールできます。GAS ライブラリとして使う場合はスクリプト ID \`${GAS_SCRIPT_ID}\` を追加してください。

以下のリンクは各ページの Markdown 版（ページ URL + \`.md\`）を指しています。\`.md\` を外すと HTML 版になります。英語版の目次は ${enLlms} にあります（各ページ URL の \`/docs/\` を \`/en/docs/\` に置き換えると英語版ページになります）。
`;
};

export const buildOptional = (
  locale: string,
  origin: string,
  localeBase: string
): string => {
  const fullUrl = `${origin}${localeBase}llms-full.txt`;
  const github = "https://github.com/akahoshi1421/gassma";
  const npm = "https://www.npmjs.com/package/gassma";

  if (locale === "en") {
    return `## Optional

- [llms-full.txt](${fullUrl}): Complete technical specification of GASsma in a single file, including edge cases and detailed behaviors
- [GitHub repository](${github}): Source code, issues, and examples
- [npm package](${npm}): Package details and release history
`;
  }

  return `## Optional

- [llms-full.txt](${fullUrl}): GASsma の完全な技術仕様を 1 ファイルにまとめたもの（エッジケースや詳細な挙動を含む）
- [GitHub repository](${github}): ソースコード、Issue、サンプル
- [npm package](${npm}): パッケージの詳細とリリース履歴
`;
};
