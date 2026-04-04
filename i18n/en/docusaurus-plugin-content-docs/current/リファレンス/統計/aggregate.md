---
sidebar_position: 1
slug: /reference/statistics/aggregate
---

# aggregate()

Use this when you want to perform statistical calculations such as averages and maximum values.

## Available Keys

| Key Name | Description                      | Optional | Notes                                                                         |
| -------- | -------------------------------- | -------- | ----------------------------------------------------------------------------- |
| where    | Specify retrieval conditions     | Yes      | If omitted, all rows are retrieved                                            |
| orderBy  | Sort settings                    | Yes      | If specifying only one column, the array can be omitted                       |
| take     | Set the number of records to retrieve | Yes |                                                                               |
| skip     | Set the number of records to skip    | Yes |                                                                               |
| cursor   | Cursor-based pagination          | Yes      | See [findMany cursor](/docs/reference/crud/read/findMany#cursor) for details  |
| \_avg    | Average display settings         | Yes      |                                                                               |
| \_count  | Hit count display settings       | Yes      |                                                                               |
| \_max    | Maximum value display settings   | Yes      |                                                                               |
| \_min    | Minimum value display settings   | Yes      |                                                                               |
| \_sum    | Sum display settings             | Yes      |                                                                               |

:::tip
In `where`, you can also use [relation filters](/docs/reference/relation/where-relation-filter) (`some` / `every` / `none` / `is` / `isNot`).
:::

## Example Sheet

![Example Sheet](../img/exampleSheet.png)

## Explanation

Suppose you want to perform the following operations from the example above.

- age => **Calculate the average**
- age => **Calculate the maximum value**
- age => **Calculate the minimum value**

The code would be as follows.

```ts
// gassma.{{TARGET_SHEET_NAME}}.aggregate
const result = gassma.sheet1.aggregate({
  _avg: {
    age: true,
  },
  _max: {
    age: true,
  },
  _min: {
    age: true,
  },
});
```

The return value is in the following format.

```ts
{
  _avg: { age: 33.333333333333336 },
  _max: { age: 55 },
  _min: { age: 20 }
}
```
