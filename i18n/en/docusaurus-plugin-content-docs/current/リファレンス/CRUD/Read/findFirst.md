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

For key options and other specifications, see [findMany()](./findMany).
