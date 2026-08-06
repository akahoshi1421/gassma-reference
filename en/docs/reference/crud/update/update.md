
# update()

Updates the **first row** matching the specified conditions and retrieves the updated record. Returns `null` if no matching record is found.

## Available Keys

| Key | Description | Optional | Notes |
| --- | --- | --- | --- |
| where | Specifies query conditions | Required | If multiple rows match, only the first row is updated |
| data | Data to update | Required | |
| select | Display settings for return value columns | Optional | Cannot be used with `omit` / `include` |
| omit | Exclusion settings for return value columns | Optional | Cannot be used with `select` |
| include | Retrieve related records | Optional | [Details here](/docs/reference/relation/include) |

`where` and `data` are required. Omitting either throws `GassmaMissingArgumentError` (e.g., Argument `where` is missing.). A `where` with no conditions at all (`where: {}`) throws `GassmaInvalidValueError` (Invalid value for argument `where`. Expected at least one condition.). The same applies when `where` becomes empty after removing `undefined` / `Gassma.skip`.

## Example Sheet

![Example Sheet](../../img/exampleSheet.png)

## Description

Suppose you want to perform the following operation on the above example:

- Set the age of the row where name is **akahoshi** to **23**

The code would be:

```ts
const gassma = new GassmaClient();

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

Fields whose `data` value is `undefined` are treated as "not specified" and are not updated.

```ts
const result = gassma.sheet1.update({
  where: { name: "akahoshi" },
  data: { name: undefined, age: 23 },
});
// => name keeps its original value; only age is updated to 23
```

If no matching record is found, `null` is returned:

```ts
const result = gassma.sheet1.update({
  where: { name: "nonexistent" },
  data: { age: 99 },
});
// => null
```

The `where` specification follows [findMany()](../read/findMany). However, unlike `findMany`, a `where` with no conditions at all (`where: {}`) throws an error (see the note above).

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

### The value passed to an operator

Passing `NaN` / `Infinity` / `-Infinity` as the argument of an operator such as `increment` throws a `GassmaInvalidValueError`. Here `{argumentName}` is the **operator key**.

```ts
gassma.sheet1.update({ where: { name: "akahoshi" }, data: { age: { increment: NaN } } });
// => Invalid value for argument `increment`. Expected a finite number, but received NaN.
```

### The result of the operation

If the **result** of the operation is `NaN` / `Infinity` / `-Infinity`, a `GassmaInvalidValueError` is thrown as well. Here `{argumentName}` is the **column name**, not the operator key.

```ts
gassma.sheet1.update({ where: { name: "akahoshi" }, data: { age: { divide: 0 } } });
// => Invalid value for argument `age`. Expected a finite number, but received Infinity.
```

If the current value is `0` and you specify `divide: 0`, the result is `0 / 0`, which is `NaN`.

```ts
// against a row whose age is 0
data: { age: { divide: 0 } };
// => Invalid value for argument `age`. Expected a finite number, but received NaN.
```

Overflow is covered too. If the result exceeds the representable range of a number it becomes `Infinity` / `-Infinity`, which is an error.

```ts
// against a row whose age is 20
data: { age: { multiply: 1e308 } };
// => Invalid value for argument `age`. Expected a finite number, but received Infinity.
```

If the result is a finite number, the update proceeds as before. When the error is thrown, no row is rewritten.

This validation runs in `update` / `updateMany` / `updateManyAndReturn`, in the update branch of `upsert`, and in the `update` of [Nested Write (update)](/docs/reference/relation/nested-write-update).

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

Number operations can only be used on **numeric columns**. Specifying `increment` and the like on a string column results in a type error. Columns made into a composite type that includes a number via `@gassma.addType` (e.g., `number | string`) are also eligible for number operations.

Number operations can be used not only in `update` but also in `updateMany` / `updateManyAndReturn`, the `update` of `upsert`, and the `data` of the `update` operation in [Nested Write (update)](/docs/reference/relation/nested-write-update).

## Nested Write

When relation definitions exist, you can describe operations on related records within `data`.

In addition to `create`'s Nested Write, `update` / `delete` / `deleteMany` / `disconnect` / `set` operations are available.

For details, see the [Nested Write (update) reference](/docs/reference/relation/nested-write-update).
