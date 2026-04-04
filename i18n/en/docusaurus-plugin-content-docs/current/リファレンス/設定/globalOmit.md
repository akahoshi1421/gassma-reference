---
sidebar_position: 2
slug: /reference/config/global-omit
---

# Global omit

By specifying `omit` in the `GassmaClient` constructor, default field exclusion is applied to all queries for the specified sheets.

## Basic Usage

```ts
const gassma = new Gassma.GassmaClient({
  omit: {
    Users: {
      password: true,
      secret: true,
    },
    Posts: {
      internalNotes: true,
    },
  },
});

// When fetching from the Users sheet, password and secret are automatically excluded
const users = gassma.Users.findMany({});
// => [{ id: 1, name: "Alice", email: "alice@example.com" }, ...]
// password and secret fields are not included
```

## Priority

Global omit, query-level `omit`, and `select` have the following priority order.

| Priority | Condition | Behavior |
| --- | --- | --- |
| 1 (highest) | `select` is specified | Ignores both global omit and query omit |
| 2 | Query `omit` is specified | Merged with global omit |
| 3 | Neither is specified | Global omit is applied as-is |

### Overriding Global omit with select

When `select` is specified, global omit is not applied.

```ts
// Global omit: { password: true }
const result = gassma.Users.findMany({
  select: { name: true, password: true },
});
// => [{ name: "Alice", password: "secret123" }]
// select takes highest priority, so password is also retrieved
```

### Overriding Global omit with Query omit

You can disable global omit on a per-field basis by specifying `false` in the query-level `omit`.

```ts
// Global omit: { password: true, secret: true }
const result = gassma.Users.findMany({
  omit: { password: false },
});
// => [{ id: 1, name: "Alice", password: "secret123" }]
// Global omit for password is disabled; only secret is excluded
```

You can specify additional fields to exclude by setting `true` in the query `omit`.

```ts
// Global omit: { password: true }
const result = gassma.Users.findMany({
  omit: { email: true },
});
// => [{ id: 1, name: "Alice" }]
// Both password (global) and email (query) are excluded
```

## Supported Methods

Global omit is applied to the following methods.

| Method | Applied |
| --- | --- |
| `findMany` | ✅ |
| `findFirst` / `findFirstOrThrow` | ✅ |
| `create` | ✅ |
| `update` | ✅ |
| `upsert` | ✅ |
| `delete` | ✅ |
| `createManyAndReturn` | ✅ |
| `updateManyAndReturn` | ✅ |

:::note
`createMany`, `updateMany`, and `deleteMany` return `{ count: number }`, so they are not affected by global omit.
:::

## Combining with Relations

```ts
const gassma = new Gassma.GassmaClient({
  omit: {
    Users: { password: true },
  },
  relations: {
    Users: {
      posts: { type: "oneToMany", to: "Posts", field: "id", reference: "authorId" },
    },
  },
});

// Can be used together with relations
const result = gassma.Users.findMany({
  include: { posts: true },
});
// => [{ id: 1, name: "Alice", posts: [...] }]
// password is excluded while relation data is also retrieved
```

## Validation

| Error | Cause |
| --- | --- |
| `GassmaFindSelectOmitConflictError` | `select` and `omit` are specified simultaneously at the query level |
