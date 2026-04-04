---
sidebar_position: 4
slug: /reference/config/updated-at
---

# updatedAt (@updatedAt)

This is the equivalent of Prisma's `@updatedAt`. It automatically sets the current timestamp on specified columns when a record is created or updated.

## Basic Usage

```ts
const gassma = new Gassma.GassmaClient({
  updatedAt: {
    Users: "updatedAt",
  },
});

// Current timestamp is automatically set during create / update
gassma.Users.create({
  data: { name: "Alice" },
});
// => { name: "Alice", updatedAt: 2026-03-14T... }

gassma.Users.update({
  where: { name: "Alice" },
  data: { name: "Bob" },
});
// => { name: "Bob", updatedAt: 2026-03-14T... } (automatically updated)
```

## Multiple Columns

You can specify multiple columns using an array.

```ts
const gassma = new Gassma.GassmaClient({
  updatedAt: {
    Posts: ["updatedAt", "lastModified"],
  },
});
```

## Applicable Methods

| Method | Applied |
| --- | --- |
| `create` / `createMany` / `createManyAndReturn` | ✅ |
| `update` / `updateMany` / `updateManyAndReturn` | ✅ |
| `upsert` (both create and update) | ✅ |

## Behavior with Explicit Values

If a value is explicitly specified by the user, the explicit value takes priority.

## Notes

`updatedAt` is not applied during cascading updates from `onDelete` / `onUpdate` (same behavior as Prisma).
