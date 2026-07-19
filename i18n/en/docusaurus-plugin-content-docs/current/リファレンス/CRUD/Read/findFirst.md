---
sidebar_position: 2
slug: /reference/crud/read/findFirst
---

# findFirst()

Used to retrieve the first row matching specific conditions.

## Available Keys

| Key | Description | Optional | Notes |
| --- | --- | --- | --- |
| where | Specifies query conditions | Optional | Retrieves all rows if omitted |
| select | Display settings for columns | Optional | Cannot be used with `omit` / `include`. Supports relation field options |
| omit | Exclusion settings for columns | Optional | Cannot be used with `select` |
| include | Retrieve related records | Optional | [Details here](/docs/reference/relation/include) |
| orderBy | Sort settings | Optional | Array can be omitted when specifying a single column |
| take | Limit number of records | Optional | Only `1` or `-1` can be specified. See below |
| skip | Number of records to skip | Optional | Negative values cause an error |
| distinct | Deduplication settings | Optional | Array can be omitted when specifying a single column |
| cursor | Cursor-based pagination | Optional | See [findMany cursor](/docs/reference/crud/read/findMany#cursor) for details |

## Example Sheet

![Example Sheet](../../img/exampleSheet.png)

## Description

Suppose you want to retrieve a row from the above example with the following condition:

- age => **20 or older**

The code would be:

```ts
const gassma = new Gassma.GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.findFirst
const result = gassma.sheet1.findFirst({
  where: {
    age: {
      gte: 20,
    },
  },
});
```

The return value has the following format:

```ts
{
  name: 'akahoshi',
  age: 22,
  pref: 'Ibaraki',
  postNumber: '310-8555'
}
```

## take

For `findFirst`, `take` can only be **`1` or `-1`**. Specifying any other value throws `GassmaFindFirstTakeError`.

- `1`: Retrieves the first record in the current order (same behavior as when omitted).
- `-1`: Reverses the order and then retrieves the first record, i.e., the record at the end.

```ts
// Retrieve the record at the end (highest age) after sorting age ascending
const result = gassma.sheet1.findFirst({
  orderBy: { age: "asc" },
  take: -1,
});
```

:::caution
Specifying anything other than `1` / `-1` throws `GassmaFindFirstTakeError`. Unlike `findMany`'s `take`, you cannot specify a number of records.
:::

## skip

Retrieves the first record after skipping `skip` records from the beginning. If no records remain after skipping, `null` is returned.

```ts
// From matching rows, skip the first 2 and retrieve the next 1
const result = gassma.sheet1.findFirst({
  where: { age: { gte: 20 } },
  skip: 2,
});
```

:::caution
Specifying a negative value for `skip` throws `GassmaSkipNegativeError`.
:::

## distinct

Retrieves the first record after excluding rows with duplicate values in the specified columns. Usage is the same as [findMany's distinct](./findMany#distinct).

## Processing Order

`findFirst` is processed in the following order, ultimately returning the first record (or `null` if none matches):

1. `where` - Filter
2. `orderBy` - Sort
3. `take` - Reverses the order when `-1`
4. `cursor` - Slice at cursor position (inclusive of the cursor itself)
5. `distinct` - Deduplication
6. `skip` - Skip the specified number of records
7. Take the first record
8. `select` / `omit` - Field shaping

For key options and other specifications, see [findMany()](./findMany).
