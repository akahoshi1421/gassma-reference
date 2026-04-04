---
sidebar_position: 7
slug: /reference/config/autoincrement
---

# autoincrement

This is the equivalent of Prisma's `autoincrement()`. It automatically assigns unique, monotonically increasing values during `create` operations.

## Basic Usage

```ts
const gassma = new Gassma.GassmaClient({
  autoincrement: {
    Users: "id",
  },
});

// id is automatically assigned during create
gassma.Users.create({
  data: { name: "Alice" },
});
// => \{ id: 1, name: "Alice" \}

gassma.Users.create({
  data: { name: "Bob" },
});
// => \{ id: 2, name: "Bob" \}
```

## Multiple Columns

You can specify multiple columns using an array.

```ts
autoincrement: {
  Users: ["id", "seq"],
}
```

## Behavior with createMany

With `createMany`, counters for all rows are reserved at once before being assigned to each row.

```ts
gassma.Users.createMany({
  data: [{ name: "Alice" }, { name: "Bob" }],
});
// => id: 1, 2 are assigned respectively
```

## How It Works

1. Exclusive control via `LockService.getScriptLock().waitLock(10000)`
2. Read the counter from `PropertiesService.getScriptProperties()`
3. Increment by +1 (+N for createMany) and write back
4. Release the lock

:::note
This feature only works in the GAS environment because it uses GAS's `LockService` and `PropertiesService`.
:::

## Behavior with Explicit Values

If a value is explicitly specified for a field, auto-increment is skipped.

```ts
gassma.Users.create({
  data: { id: 100, name: "Alice" },
});
// => id is 100 (auto-increment is not applied)
```
