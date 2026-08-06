
# updatedAt (@updatedAt)

This is the equivalent of Prisma's `@updatedAt`. It automatically sets the current timestamp on specified columns when a record is created or updated.

## Schema vs. Constructor

When using the CLI, this setting is written in `schema.prisma`. When using the GAS editor alone, you pass it to the `GassmaClient` constructor (the examples on the rest of this page use the constructor form).

| | How to write it |
| --- | --- |
| Schema (CLI) | `updatedAt DateTime @updatedAt` |
| Constructor ([GAS editor](/docs/reference/gas-editor)) | `updatedAt: { Users: "updatedAt" }` |

```prisma
model Users {
  id        Int      @id
  name      String
  updatedAt DateTime @updatedAt
}
```

For how to write schemas, see [Schema](/docs/reference/schema).

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
