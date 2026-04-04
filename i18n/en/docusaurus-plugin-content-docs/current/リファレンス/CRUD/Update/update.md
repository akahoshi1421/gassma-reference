---
sidebar_position: 0
slug: /reference/crud/update/update
---

# update()

Updates the **first row** matching the specified conditions and retrieves the updated record. Returns `null` if no matching record is found.

## Available Keys

| Key | Description | Optional | Notes |
| --- | --- | --- | --- |
| where | Specifies query conditions | Optional | Targets the first row if omitted |
| data | Data to update | Required | |
| select | Display settings for return value columns | Optional | Cannot be used with `omit` / `include` |
| omit | Exclusion settings for return value columns | Optional | Cannot be used with `select` |
| include | Retrieve related records | Optional | [Details here](/docs/reference/relation/include) |

## Example Sheet

![Example Sheet](../../img/exampleSheet.png)

## Description

Suppose you want to perform the following operation on the above example:

- Set the age of the row where name is **akahoshi** to **23**

The code would be:

```ts
const gassma = new Gassma.GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.update
const result = gassma.sheet1.update({
  where: {
    name: "akahoshi",
  },
  data: {
    age: 23,
  },
});
```

The return value has the following format:

```ts
{
  name: 'akahoshi',
  age: 23,
  pref: 'Ibaraki',
  postNumber: '310-8555'
}
```

The updated record is returned. Fields that were not updated retain their original values.

If no matching record is found, `null` is returned:

```ts
const result = gassma.sheet1.update({
  where: { name: "nonexistent" },
  data: { age: 99 },
});
// => null
```

The `where` specification follows [findMany()](../read/findMany).

## Atomic Number Operations

By specifying `increment` / `decrement` / `multiply` / `divide` in `data`, you can perform operations on the current value:

```ts
// Increment age by 1
const result = gassma.sheet1.update({
  where: { name: "akahoshi" },
  data: {
    age: { increment: 1 },
  },
});
// age: 22 → 23
```

| Operation | Behavior | Example |
| --- | --- | --- |
| increment | Addition | `{ increment: 5 }` → current value + 5 |
| decrement | Subtraction | `{ decrement: 3 }` → current value - 3 |
| multiply | Multiplication | `{ multiply: 2 }` → current value × 2 |
| divide | Division | `{ divide: 4 }` → current value ÷ 4 |

If the current value is not a number, `0` is used as the base for calculations.

You can also combine it with regular value assignments:

```ts
const result = gassma.sheet1.update({
  where: { name: "akahoshi" },
  data: {
    age: { increment: 1 },
    pref: "Tokyo",
  },
});
```

## Nested Write

When relation definitions exist, you can describe operations on related records within `data`.

In addition to `create`'s Nested Write, `update` / `delete` / `deleteMany` / `disconnect` / `set` operations are available.

For details, see the [Nested Write (update) reference](/docs/reference/relation/nested-write-update).
