---
sidebar_position: 3
slug: /reference/config/defaults
description: "Auto-set field values on create with static values or functions (@default)"
---

# defaults (@default)

This is the equivalent of Prisma's `@default()`. It automatically sets default values for fields during `create` operations.

## Schema vs. Constructor

When using the CLI, this setting is written in `schema.prisma`. When using the GAS editor alone, you pass it to the `GassmaClient` constructor (the examples on the rest of this page use the constructor form).

| | How to write it |
| --- | --- |
| Schema (CLI) | `role String @default("USER")` |
| Constructor ([GAS editor](/docs/reference/gas-editor)) | `defaults: { Users: { role: "USER" } }` |

```prisma
model Users {
  id        Int      @id
  name      String
  role      String   @default("USER")
  createdAt DateTime @default(now())
}
```

For how to write schemas, see [Schema](/docs/reference/schema).

## Basic Usage

```ts
const gassma = new Gassma.GassmaClient({
  defaults: {
    Users: {
      role: "USER",
      createdAt: () => new Date(),
    },
  },
});

// Default values are automatically applied during create
gassma.Users.create({
  data: { name: "Alice" },
});
// => { name: "Alice", role: "USER", createdAt: 2026-03-14T... }
```

## Static Values and Functions

You can specify both fixed values and functions as default values.

| Type | Example | Behavior |
| --- | --- | --- |
| Static value | `role: "USER"` | Sets the same value every time |
| Function | `createdAt: () => new Date()` | Evaluated on each invocation |

## Applicable Methods

| Method | Applied |
| --- | --- |
| `create` | ✅ |
| `createMany` / `createManyAndReturn` | ✅ |
| `upsert` (create part only) | ✅ |

## Behavior with Explicit Values

If a field is explicitly specified (including `null`), the default value is not applied.

```ts
gassma.Users.create({
  data: { name: "Alice", role: "ADMIN" },
});
// => role is "ADMIN" (default value "USER" is not applied)
```

## Validation of Default Values

Values produced as defaults go through the same validation as values written directly in `data`. If a default returns something a cell cannot hold, a `GassmaInvalidValueError` is thrown and no rows are written.

```ts
const gassma = new Gassma.GassmaClient({
  defaults: {
    Users: { age: () => NaN },
  },
});

gassma.Users.createMany({ data: [{ name: "Alice" }] });
// => Invalid value for argument `age`. Expected a finite number, but received NaN.
```

Here `{argumentName}` is the column name. `NaN` / `Infinity` / `-Infinity`, invalid Dates (Invalid Date) and objects other than `Date` are covered. For details, see the [error list](/docs/reference/errors#values-a-cell-cannot-hold).
