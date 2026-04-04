---
sidebar_position: 3
slug: /reference/config/defaults
---

# defaults (@default)

This is the equivalent of Prisma's `@default()`. It automatically sets default values for fields during `create` operations.

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
