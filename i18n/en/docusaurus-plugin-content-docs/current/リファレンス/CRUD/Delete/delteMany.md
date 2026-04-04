---
sidebar_position: 1
slug: /reference/crud/delete/deleteMany
---

# deleteMany()

Used to delete all rows matching the specified conditions.

## Available Keys

| Key | Description | Optional | Notes |
| --- | --- | --- | --- |
| where | Specifies deletion conditions | Optional | Targets all rows if omitted |
| limit | Maximum number of records to delete | Optional | Negative values cause an error |

## Example Sheet

![Example Sheet](../../img/exampleSheet.png)

## Description

Suppose you want to perform the following operation on the above example:

- age => **Delete rows with value 20**

The code would be:

```ts
const gassma = new Gassma.GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.deleteMany
const result = gassma.sheet1.deleteMany({
  where: {
    age: 20,
  },
});
```

The return value has the following format:

```ts
{
  count: 1;
}
```

The number of deleted rows is returned.

## limit

You can specify the maximum number of records to delete:

```ts
// Delete at most 3 records
const result = gassma.sheet1.deleteMany({
  where: {
    pref: "Tokyo",
  },
  limit: 3,
});
```

Specifying `limit: 0` results in 0 deletions (nothing is deleted).

:::caution
Specifying a negative value for `limit` throws `GassmaLimitNegativeError`.
:::

The `where` specification follows [findMany()](../read/findMany).
