---
sidebar_position: 3
slug: /reference/crud/read/findFirstOrThrow
---

# findFirstOrThrow()

Used to retrieve the first row matching specific conditions. Works the same as `findFirst`, but throws an error instead of returning `null` when no record is found.

## Available Keys

| Key | Description | Optional | Notes |
| --- | --- | --- | --- |
| where | Specifies query conditions | Optional | Retrieves all rows if omitted |
| select | Display settings for columns | Optional | Cannot be used with `omit` / `include` |
| omit | Exclusion settings for columns | Optional | Cannot be used with `select` |
| include | Retrieve related records | Optional | [Details here](/docs/reference/relation/include) |
| orderBy | Sort settings | Optional | Array can be omitted when specifying a single column |
| take | Limit number of records | Optional | |
| skip | Number of records to skip | Optional | |
| distinct | Deduplication settings | Optional | Array can be omitted when specifying a single column |

## Example Sheet

![Example Sheet](../../img/exampleSheet.png)

## Description

Suppose you want to retrieve a row from the above example with the following condition:

- age => **20 or older**

The code would be:

```ts
const gassma = new Gassma.GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.findFirstOrThrow
const result = gassma.sheet1.findFirstOrThrow({
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

## Differences from findFirst

The behavior differs when no record is found:

```ts
// findFirst → returns null
const result = gassma.sheet1.findFirst({
  where: { name: "nonexistent" },
});
// => null

// findFirstOrThrow → throws NotFoundError
const result = gassma.sheet1.findFirstOrThrow({
  where: { name: "nonexistent" },
});
// => NotFoundError: No record found
```

For other specifications, see [findMany()](./findMany).
