---
sidebar_position: 8
slug: /reference/config/strict-undefined-checks
---

# strictUndefinedChecks / Gassma.skip

This feature corresponds to Prisma's `strictUndefinedChecks` (Preview feature) and `Prisma.skip`. It detects unintended `undefined` values that slip into query inputs as runtime errors, and lets you explicitly omit a field with `Gassma.skip`.

## Gassma.skip

`Gassma.skip` is a symbol that, when passed as a field value in a query, treats that field as "not specified".

```ts
const search: string | undefined = getSearchWord();

const users = gassma.Users.findMany({
  where: {
    // If search is missing, the name condition itself is omitted
    name: search ?? Gassma.skip,
  },
});
```

`Gassma.skip` can always be used regardless of whether `strictUndefinedChecks` is enabled. It is available anywhere in query inputs, including `where` / `data` / `create` / `update` / `select` / `omit` / `orderBy`.

## Enabling strictUndefinedChecks

`strictUndefinedChecks` is an opt-in feature. There are two ways to enable it.

| | How to write it |
| --- | --- |
| Schema (CLI) | `previewFeatures = ["strictUndefinedChecks"]` |
| Constructor ([GAS editor](/docs/reference/gas-editor)) | `strictUndefinedChecks: true` |

### Enable via previewFeatures (with CLI)

When using the CLI, add `previewFeatures` to the `generator` block in `schema.prisma` (same syntax as Prisma).

```prisma
generator client {
  provider        = "prisma-client-js"
  output          = "./src/generated/gassma"
  previewFeatures = ["strictUndefinedChecks"]
}
```

When you run `npx gassma generate`, `strictUndefinedChecks: true` is automatically embedded into the generated client. The generated type definitions also accept `Gassma.skip` (via `Gassma.SkipValue`).

### Enable via the constructor (without CLI)

In a setup without the CLI, specify it in the `GassmaClient` constructor.

```ts
const gassma = new Gassma.GassmaClient({
  strictUndefinedChecks: true,
});
```

## Behavior When Enabled

When enabled, a `GassmaUndefinedValueError` is thrown if a query input contains an **explicit `undefined`**. Nested inputs (Nested Writes, `select` inside `include`, etc.) are checked recursively.

```ts
const userName = undefined;

gassma.Users.deleteMany({
  where: { name: userName },
});
// => GassmaUndefinedValueError:
//    Invalid value for argument `where.name`: explicitly `undefined` values are not allowed.
```

When disabled (the default), `undefined` is treated as "this field was not specified", as described below. An unintended `undefined` slipping into a query can silently drop a condition and widen the affected rows (in the example above, the `deleteMany` would delete every row). With this feature enabled, such bugs are detected immediately at runtime.

If you want to omit a field, use `Gassma.skip` instead of `undefined`.

```ts
gassma.Users.deleteMany({
  where: { name: userName ?? Gassma.skip },
});
// Executed with the name condition omitted
```

## Behavior When Disabled (Default)

When `strictUndefinedChecks` is disabled, an `undefined` in a query input is treated as **"this field was not specified"**, same as Prisma. This applies everywhere in query inputs: `where` conditions, inside operators (`equals` / `gt` / `in`, etc.), inside `AND` / `OR` / `NOT`, relation filters, `orderBy`, `select` keys, and so on.

```ts
// The age condition is treated as "not specified", so every row is returned
gassma.Users.findMany({
  where: { age: undefined },
});
```

Likewise, passing `undefined` in `update`'s `data` means **that field is not updated** (the cell value is preserved).

```ts
gassma.Users.update({
  where: { id: 1 },
  data: { name: undefined, age: 21 },
});
// => name keeps its original value; only age is updated to 21
```

:::caution
If the `where` conditions become empty because they consisted only of `undefined` (or `Gassma.skip`), `findMany` / `updateMany` / `deleteMany` and similar operations target **every row**. For the single-row operations `update` / `delete` / `upsert`, an empty `where` throws a `GassmaInvalidValueError` (see [update](/docs/reference/crud/update/update)).
:::

## Recommendation: exactOptionalPropertyTypes

:::note
To fully forbid assigning `undefined` at the type level as well, we recommend enabling `exactOptionalPropertyTypes` in your project's `tsconfig.json` (same as Prisma).

```json
{
  "compilerOptions": {
    "exactOptionalPropertyTypes": true
  }
}
```

With this setting, code that explicitly passes `undefined` to an optional field becomes a compile error.
:::

## Not Usable Inside Arrays

:::caution
`Gassma.skip` cannot be passed as an array element. A `GassmaSkipInArrayError` is thrown regardless of whether `strictUndefinedChecks` is enabled. Use `null` or filter it out of the array beforehand.

```ts
gassma.Users.findMany({
  where: {
    id: { in: [1, Gassma.skip, 3] },
  },
});
// => GassmaSkipInArrayError:
//    Invalid value for argument `where.id.in[1]`: Can not use `Gassma.skip` value
//    within array. Use `null` or filter out `Gassma.skip` values.
```

The same applies to `undefined` as an array element. If an array such as `in` / `notIn` / `AND` / `OR` / `NOT` / `orderBy` / `distinct` contains an `undefined` element, a `GassmaUndefinedValueError` is thrown regardless of whether `strictUndefinedChecks` is enabled (same behavior as Prisma).

```ts
gassma.Users.findMany({
  where: {
    id: { in: [1, undefined, 3] },
  },
});
// => GassmaUndefinedValueError:
//    Invalid value for argument `where.id.in[1]`: explicitly `undefined` values are not allowed.
```

:::

## Validation

| Error | Cause |
| --- | --- |
| `GassmaUndefinedValueError` | An explicit `undefined` is specified in a query input while `strictUndefinedChecks` is enabled. For array elements, `undefined` throws whether enabled or not |
| `GassmaSkipInArrayError` | `Gassma.skip` is specified as an array element (occurs whether enabled or not) |
| `GassmaInvalidValueError` | The `where` of `update` / `delete` / `upsert` became empty after removing `undefined` / `Gassma.skip` |
