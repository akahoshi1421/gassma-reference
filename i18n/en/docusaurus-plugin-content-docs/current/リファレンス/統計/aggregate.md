---
sidebar_position: 1
slug: /reference/statistics/aggregate
description: "Compute aggregations such as _avg, _sum, _min, _max, and _count"
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
| \_count  | Hit count display settings       | Yes      | `_all` and the `true` shorthand are also available. See [\_count](#_count) for details |
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

## _count

Use this when you want to get the number of matching rows.

### Counting a Specific Column

If you specify a column name in `_count`, only rows whose value in that column is not null (an empty cell) are counted.

```ts
// gassma.{{TARGET_SHEET_NAME}}.aggregate
const result = gassma.sheet1.aggregate({
  _count: {
    age: true,
  },
});
```

The return value is in the following format.

```ts
{
  _count: { age: 9 }
}
```

### Counting All Rows with _all

If you specify `_all: true`, all rows are counted, including null.

```ts
// gassma.{{TARGET_SHEET_NAME}}.aggregate
const result = gassma.sheet1.aggregate({
  _count: {
    _all: true,
    postNumber: true,
  },
});
```

The return value is in the following format.

```ts
{
  _count: { _all: 9, postNumber: 9 }
}
```

Since column counts skip null rows, on a sheet where, for example, two rows have an empty postNumber, the results would differ like `{ _all: 9, postNumber: 7 }`.

### The true Shorthand

If you specify `_count: true`, the total number of rows is returned directly as a number.

```ts
// gassma.{{TARGET_SHEET_NAME}}.aggregate
const result = gassma.sheet1.aggregate({
  _count: true,
});
```

The return value is in the following format.

```ts
{
  _count: 9
}
```

:::note
`_all` and the `true` shorthand are exclusive to `_count` and cannot be used with `_avg` / `_max` / `_min` / `_sum`. `_count` counts rows, so "all rows including null" is meaningful, while the other aggregations target the values of a specific column.
:::
