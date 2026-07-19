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

### Enable via previewFeatures (with CLI)

If you are doing [local development with a Prisma schema](/docs/reference/type-generation), add `previewFeatures` to the `generator` block in `schema.prisma` (same syntax as Prisma).

```prisma
generator client {
  provider        = "prisma-client-js"
  output          = "./generated/gassma"
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

An unintended `undefined` slipping into a query can lead to accidents such as conditions silently changing, or `undefined` being written as-is as a value in `update`. With this feature enabled, such bugs are detected immediately at runtime.

If you want to omit a field, use `Gassma.skip` instead of `undefined`.

```ts
gassma.Users.deleteMany({
  where: { name: userName ?? Gassma.skip },
});
// Executed with the name condition omitted
```

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

:::

## Validation

| Error | Cause |
| --- | --- |
| `GassmaUndefinedValueError` | An explicit `undefined` is specified in a query input while `strictUndefinedChecks` is enabled |
| `GassmaSkipInArrayError` | `Gassma.skip` is specified as an array element (occurs whether enabled or not) |
