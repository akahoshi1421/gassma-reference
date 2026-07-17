// llms.txt / per-page Markdown を postBuild で生成する local plugin。
// 入力はビルド済み docs メタデータ（sidebars の並び順 + frontmatter description）。

import fs from "node:fs/promises";
import path from "node:path";
import type { LoadContext, Plugin, Props } from "@docusaurus/types";
import {
  EXCLUDED_SOURCE_SUFFIXES,
  SECTIONS,
  buildHeader,
  buildOptional,
} from "./manifest";

type DocEntry = {
  title: string;
  description: string;
  permalink: string;
  sourcePath: string;
  order: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asText = (value: unknown): string =>
  typeof value === "string" ? value : "";

const flattenSidebar = (items: unknown, acc: string[]): void => {
  if (!Array.isArray(items)) return;
  items.forEach((item) => {
    if (!isRecord(item)) return;
    if (item.type === "doc" && typeof item.id === "string") acc.push(item.id);
    if (item.type === "category") flattenSidebar(item.items, acc);
  });
};

const collectDocs = (props: Props): DocEntry[] => {
  const docsPlugin = props.plugins.find(
    (plugin) => plugin.name === "docusaurus-plugin-content-docs"
  );
  if (!docsPlugin || !isRecord(docsPlugin.content)) return [];
  const versions = docsPlugin.content.loadedVersions;
  if (!Array.isArray(versions) || !isRecord(versions[0])) return [];
  const version = versions[0];

  const orderedIds: string[] = [];
  if (isRecord(version.sidebars)) {
    Object.values(version.sidebars).forEach((sidebar) =>
      flattenSidebar(sidebar, orderedIds)
    );
  }
  const orderById = new Map(orderedIds.map((id, index) => [id, index]));

  const docs = Array.isArray(version.docs) ? version.docs : [];
  const entries: DocEntry[] = [];
  docs.forEach((doc) => {
    if (!isRecord(doc)) return;
    const source = asText(doc.source);
    if (EXCLUDED_SOURCE_SUFFIXES.some((suffix) => source.endsWith(suffix))) {
      return;
    }
    entries.push({
      title: asText(doc.title),
      description: asText(doc.description).replace(/\s*\n\s*/g, " "),
      permalink: asText(doc.permalink),
      sourcePath: source.replace(/^@site\//, ""),
      order: orderById.get(asText(doc.id)) ?? Number.MAX_SAFE_INTEGER,
    });
  });
  return entries.sort(
    (a, b) => a.order - b.order || a.permalink.localeCompare(b.permalink)
  );
};

const stripDocusaurusSyntax = (markdown: string): string => {
  const body = markdown.replace(/^---\n[\s\S]*?\n---\n/, "");
  let inFence = false;
  const kept = body.split("\n").filter((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return true;
    }
    if (inFence) return true;
    return !/^:{3,}[A-Za-z-]*(\[.*\])?$/.test(line.trim());
  });
  return kept.join("\n");
};

const writePageMarkdown = async (props: Props, doc: DocEntry): Promise<void> => {
  const relRoute = doc.permalink.slice(props.baseUrl.length);
  const raw = await fs.readFile(
    path.join(props.siteDir, doc.sourcePath),
    "utf8"
  );
  const outPath = path.join(props.outDir, `${relRoute}.md`);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, stripDocusaurusSyntax(raw));
};

const buildLlmsTxt = (props: Props, docs: DocEntry[]): string => {
  const locale = props.i18n.currentLocale;
  const origin = props.siteConfig.url;
  const isDefault = locale === props.i18n.defaultLocale;
  const rootBase = isDefault
    ? props.baseUrl
    : props.baseUrl.replace(new RegExp(`${locale}/$`), "");

  const buckets = SECTIONS.map((): DocEntry[] => []);
  const rest: DocEntry[] = [];
  docs.forEach((doc) => {
    const route = `/${doc.permalink.slice(props.baseUrl.length)}`;
    const index = SECTIONS.findIndex((section) =>
      section.routes.some((r) => route === r || route.startsWith(`${r}/`))
    );
    if (index === -1) rest.push(doc);
    else buckets[index].push(doc);
  });

  const blocks: string[] = [buildHeader(locale, origin, rootBase)];
  const pushSection = (title: string, sectionDocs: DocEntry[]): void => {
    if (sectionDocs.length === 0) return;
    const links = sectionDocs.map((doc) => {
      const desc = doc.description ? `: ${doc.description}` : "";
      return `- [${doc.title}](${origin}${doc.permalink}.md)${desc}`;
    });
    blocks.push(`## ${title}\n\n${links.join("\n")}\n`);
  };
  SECTIONS.forEach((section, index) => pushSection(section.title, buckets[index]));
  pushSection("Other", rest);
  blocks.push(buildOptional(locale, origin, props.baseUrl));
  return blocks.join("\n");
};

export default function llmsTxtPlugin(_context: LoadContext): Plugin<undefined> {
  return {
    name: "gassma-llms-txt",
    async postBuild(props): Promise<void> {
      const docs = collectDocs(props);
      await Promise.all(docs.map((doc) => writePageMarkdown(props, doc)));
      await fs.writeFile(
        path.join(props.outDir, "llms.txt"),
        buildLlmsTxt(props, docs)
      );
      console.log(
        `[gassma-llms-txt] ${props.i18n.currentLocale}: llms.txt + ${docs.length} ページの Markdown を生成しました`
      );
    },
  };
}
