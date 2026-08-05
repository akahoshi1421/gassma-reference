---
sidebar_position: 4
slug: /reference/gas-editor
description: "Using GASsma from the GAS script editor alone, without the CLI: initializing Gassma.GassmaClient and the full list of constructor options"
---

# Using the GAS Editor

GASsma also works from the GAS script editor alone, without the CLI. Once you add the library you can start writing immediately, which suits small scripts or trying things out without setting up a local environment.

This page covers how to write code when using only the GAS editor. For the CLI workflow, see [Basics](/docs/reference/basic).

:::note
Both styles use the same library and the same features. The only difference is **where you write the configuration**: with the CLI you write it in `schema.prisma`, and with the GAS editor alone you pass it to the constructor.
:::

## Adding the Library

Add script ID `1ZVuWMUYs4hVKDCcP3nVw74AY48VqLm50wRceKIQLFKL0wf4Hyou-FIBH` as a library. See [Installation](/docs/installation) for the steps.

Once added, you can create a client from the global `Gassma` namespace.

## Creating an Instance

If your GAS project is bound to a spreadsheet (container-bound), you can create an instance with no arguments.

```ts
const gassma = new Gassma.GassmaClient();
```

If you created the GAS project somewhere other than a spreadsheet, or want to work with a different spreadsheet, pass the target spreadsheet ID.

```ts
const gassma = new Gassma.GassmaClient("XXXXXXXXXXXXXXXXXXX");
```

### Initialization with an Options Object

When you need configuration such as relation definitions or global omit, pass an options object.

```ts
const gassma = new Gassma.GassmaClient({
  id: "XXXXXXXXXXXXXXXXXXX", // optional
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

## Constructor Options

| Option | Description | Reference |
| --- | --- | --- |
| `id` | Spreadsheet ID (defaults to the active spreadsheet) | - |
| `relations` | Relation definitions | [Relation Definitions](/docs/reference/relation/definition) |
| `omit` | Global omit settings | [Global omit](/docs/reference/config/global-omit) |
| `defaults` | Field default values | [defaults](/docs/reference/config/defaults) |
| `updatedAt` | Auto-updated timestamps | [updatedAt](/docs/reference/config/updated-at) |
| `ignore` | Field-level exclusion | [ignore](/docs/reference/config/ignore) |
| `ignoreSheets` | Sheet-level exclusion | [ignore](/docs/reference/config/ignore) |
| `map` | Field name mapping | [map](/docs/reference/config/map) |
| `mapSheets` | Sheet name mapping | [map](/docs/reference/config/map) |
| `autoincrement` | Auto-increment | [autoincrement](/docs/reference/config/autoincrement) |
| `strictUndefinedChecks` | Turns explicit `undefined` in query inputs into runtime errors | [strictUndefinedChecks / Gassma.skip](/docs/reference/config/strict-undefined-checks) |

## Schema Equivalents

When using the CLI, most of the options above are written as attributes in `schema.prisma`.

| Constructor option | How to write it in the schema |
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
| `omit` | No schema equivalent (specify it in the constructor even when using the CLI) |
| `id` | The `url` of the `datasource` block, or `datasource.url` in `gassma.config.ts` |

For details on each setting, see [Schema](/docs/reference/schema).

## About Types

The GAS editor has no generated type definitions, so there is no completion or type checking for sheet names and column names. Mistakes in sheet or column names surface at runtime.

If you want type-safe development, consider using the CLI ([Quickstart](/docs/quickstart)).

## Referring to Error Classes

The error classes GASsma throws are available from the `Gassma` namespace.

```ts
try {
  gassma.Users.findFirstOrThrow({ where: { id: 999 } });
} catch (e) {
  if (e instanceof Gassma.NotFoundError) {
    console.log("Not found");
  }
}
```

For the full list, see [Error List](/docs/reference/errors).

:::note
Built-in types such as `Date` cannot be checked with `instanceof` across the library boundary. See [Basics](/docs/reference/basic#checking-date-values) for details.
:::
