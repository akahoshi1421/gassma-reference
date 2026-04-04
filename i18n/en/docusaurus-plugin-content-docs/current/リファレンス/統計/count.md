---
sidebar_position: 2
slug: /reference/statistics/count
---

# count()

Use this when you want to get the number of matching records.

## Available Keys

| Key Name | Description                      | Optional | Notes                                                                         |
| -------- | -------------------------------- | -------- | ----------------------------------------------------------------------------- |
| where    | Specify retrieval conditions     | Yes      | If omitted, all rows are retrieved                                            |
| orderBy  | Sort settings                    | Yes      | If specifying only one column, the array can be omitted                       |
| take     | Set the number of records to retrieve | Yes |                                                                               |
| skip     | Set the number of records to skip    | Yes |                                                                               |
| cursor   | Cursor-based pagination          | Yes      | See [findMany cursor](/docs/reference/crud/read/findMany#cursor) for details  |

:::tip
In `where`, you can also use [relation filters](/docs/reference/relation/where-relation-filter) (`some` / `every` / `none` / `is` / `isNot`).
:::

## Example Sheet

![Example Sheet](../img/exampleSheet.png)

## Explanation

Suppose you want to perform the following operation from the example above.

- age => **20 or greater**

The code would be as follows.

```ts
// gassma.{{TARGET_SHEET_NAME}}.count
const result = gassma.sheet1.count({
  where: {
    age: {
      gte: 20,
    },
  },
});
```

The return value is in the following format.

```
9
```
