---
sidebar_position: 6
slug: /reference/fields
---

# fields (Column Comparison)

Use the `fields` property within `where` conditions when you want to compare against **the value of another column in the same row** instead of a fixed value.

## Basic Usage

Obtain a `FieldRef` from the `fields` property of each sheet controller and pass it as a value in filter conditions.

```ts
const gassma = new Gassma.GassmaClient();
const userSheet = gassma.Users;

// Search for users where firstName equals lastName
const result = userSheet.findMany({
  where: {
    firstName: { equals: userSheet.fields.lastName },
  },
});
```

The above example compares `firstName` and `lastName` values for each row, returning only rows where they match.

## Available Operators

`FieldRef` can be used with the following operators:

| Operator | Description | Example |
| --- | --- | --- |
| equals | Equal to | `{ equals: sheet.fields.otherColumn }` |
| lt | Less than | `{ lt: sheet.fields.maxValue }` |
| lte | Less than or equal to | `{ lte: sheet.fields.maxValue }` |
| gt | Greater than | `{ gt: sheet.fields.minValue }` |
| gte | Greater than or equal to | `{ gte: sheet.fields.minValue }` |
| contains | Contains the string | `{ contains: sheet.fields.keyword }` |
| startsWith | Starts with the string | `{ startsWith: sheet.fields.prefix }` |
| endsWith | Ends with the string | `{ endsWith: sheet.fields.suffix }` |

:::caution
`FieldRef` cannot be used with `not`, `in`, or `notIn`.
:::

## Numeric Comparison

```ts
// Search for users where age is less than maxAge
const result = userSheet.findMany({
  where: {
    age: { lt: userSheet.fields.maxAge },
  },
});
```

## String Comparison

```ts
// Search for records where fullName contains the firstName value
const result = userSheet.findMany({
  where: {
    fullName: { contains: userSheet.fields.firstName },
  },
});
```

## Combining with mode: "insensitive"

`FieldRef` can be combined with `mode: "insensitive"` for case-insensitive comparison:

```ts
const result = userSheet.findMany({
  where: {
    firstName: {
      equals: userSheet.fields.lastName,
      mode: "insensitive",
    },
  },
});
```

## Usage with AND / OR / NOT

`FieldRef` can also be used within logical operators:

```ts
const result = userSheet.findMany({
  where: {
    OR: [
      { firstName: { equals: userSheet.fields.lastName } },
      { age: { gt: userSheet.fields.minAge } },
    ],
  },
});
```

## Supported Methods

`fields` can be used with all methods that support `where`:

- `findMany` / `findFirst` / `findFirstOrThrow`
- `update` / `updateMany` / `updateManyAndReturn`
- `delete` / `deleteMany`
- `upsert`
- `count` / `aggregate` / `groupBy`

## When Referenced Column Doesn't Exist

If the column name specified in `FieldRef` does not exist in the sheet, the condition will not match (no error is thrown).
