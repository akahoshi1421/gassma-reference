import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "GASsma",
  tagline: "Like ORM GAS library for Google Sheets",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://akahoshi1421.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/gassma-reference/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "akahoshi1421", // Usually your GitHub org/user name.
  projectName: "gassma-reference", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "ja",
    locales: ["ja", "en"],
    localeConfigs: {
      ja: {
        label: "日本語",
      },
      en: {
        label: "English",
      },
    },
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      "@signalwire/docusaurus-plugin-llms-txt",
      {
        logLevel: 2,
        siteTitle: "GASsma",
        siteDescription:
          "GASsma is a Google Apps Script (GAS) library that lets you operate Google Sheets like a database with a Prisma-like, type-safe API. It provides CRUD operations, filtering, sorting, pagination, aggregation, relations, and nested writes on spreadsheet data.",
        depth: 2,
        includeOrder: [
          "/gassma-reference/docs/reference/crud/**",
          "/gassma-reference/docs/reference/statistics/**",
          "/gassma-reference/docs/reference/relation/**",
          "/gassma-reference/docs/reference/config/**",
          "/gassma-reference/docs/reference/settings/**",
          "/gassma-reference/en/docs/reference/crud/**",
          "/gassma-reference/en/docs/reference/statistics/**",
          "/gassma-reference/en/docs/reference/relation/**",
          "/gassma-reference/en/docs/reference/config/**",
          "/gassma-reference/en/docs/reference/settings/**",
        ],
        optionalLinks: [
          {
            title: "GitHub repository",
            url: "https://github.com/akahoshi1421/gassma",
            description: "Source code, issues, and examples",
          },
          {
            title: "npm package",
            url: "https://www.npmjs.com/package/gassma",
            description: "Package details and release history",
          },
        ],
        content: {
          relativePaths: false,
          excludeRoutes: [
            "/gassma-reference/docs/リファレンス/**",
            "/gassma-reference/en/docs/リファレンス/**",
          ],
          routeRules: [
            { route: "/gassma-reference/docs/**", depth: 2 },
            { route: "/gassma-reference/docs/reference", depth: 3 },
            { route: "/gassma-reference/docs/reference/**", depth: 4 },
            { route: "/gassma-reference/docs/reference/basic", depth: 3 },
            { route: "/gassma-reference/docs/reference/fields", depth: 3 },
            { route: "/gassma-reference/docs/reference/errors", depth: 3 },
            {
              route: "/gassma-reference/docs/reference/type-generation",
              depth: 3,
            },
            { route: "/gassma-reference/en/docs/**", depth: 3 },
            { route: "/gassma-reference/en/docs/reference", depth: 4 },
            { route: "/gassma-reference/en/docs/reference/**", depth: 5 },
            { route: "/gassma-reference/en/docs/reference/basic", depth: 4 },
            { route: "/gassma-reference/en/docs/reference/fields", depth: 4 },
            { route: "/gassma-reference/en/docs/reference/errors", depth: 4 },
            {
              route: "/gassma-reference/en/docs/reference/type-generation",
              depth: 4,
            },
          ],
        },
      },
    ],
  ],

  themes: [
    [
      "@cmfcmf/docusaurus-search-local",
      {
        language: ["ja", "en"],
        indexBlog: false,
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/GASsma-social-card.jpg",
    navbar: {
      title: "GASsma",
      logo: {
        alt: "GASsma Logo",
        src: "img/GASsmaLogo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "Docs",
        },
        {
          type: "localeDropdown",
          position: "right",
        },
        {
          href: "https://github.com/akahoshi1421/gassma",
          position: "right",
          className: "header-github-link",
          "aria-label": "GitHub repository",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Tutorial",
              to: "/docs/intro",
            },
          ],
        },
        // {
        //   title: "Community",
        //   items: [
        //     {
        //       label: "X",
        //       href: "https://x.com/docusaurus",
        //     },
        //   ],
        // },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/akahoshi1421/gassma",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Hiroki Akahoshi. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
