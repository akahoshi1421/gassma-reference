---
sidebar_position: 2
slug: /reference/client-extensions/result
---

# $extends (result)

The `result` component of `$extends` lets you add **computed fields** to the records in query results. It corresponds to Prisma's client extensions (the `result` component of `$extends`). You can compute new fields from existing scalar fields and include them in the result.

To intercept the query execution itself, see [$extends (query)](/docs/reference/client-extensions/query).

## Basic Usage

Calling `gassma.$extends({ result: {...} })` returns a **new client with a new result type** that includes the computed fields. The original `gassma` is left unchanged.

A computed field is defined as a pair of `needs` (the scalar fields required for the computation) and `compute` (the computation function).

```ts
const extended = gassma.$extends({
  result: {
    Users: {
      greeting: {
        needs: { name: true },
        compute(user) {
          return `Hi ${user.name}`;
        },
      },
    },
  },
});

const user = extended.Users.findFirst({ where: { id: 1 } });
user.greeting; // "Hi Alice"
```

## needs and compute

| Key | Description |
| --- | --- |
| `needs` | Declares the **scalar fields** required for the computation, as `{ fieldName: true }` |
| `compute` | Receives a record containing only the fields declared in `needs`, and returns the computed value |

The record passed to `compute` contains only the fields declared in `needs`, and its **type is derived from `needs` as well**. No type annotation is needed.

```ts
const extended = gassma.$extends({
  result: {
    Users: {
      greeting: {
        needs: { name: true },
        // user is typed as { name: string }
        compute(user) {
          return `Hi ${user.name}`;
        },
      },
    },
  },
});
```

:::note
Only **scalar fields** can be specified in `needs`. Relations cannot be specified.
:::

## Added as Plain Properties

Computed fields are not getters; they are added to the result as **plain properties computed on the spot**. As a result, they behave stably with `Logger.log` / `JSON.stringify` / the spread syntax.

```ts
const user = extended.Users.findFirst({ where: { id: 1 } });

Logger.log(user.greeting); // "Hi Alice"
JSON.stringify(user); // includes greeting
const copy = { ...user }; // copy.greeting is preserved
```

## Operations That Get Computed Fields

Computed fields are added to the results of **operations that return records**.

| Added | Not added |
| --- | --- |
| `findFirst` / `findFirstOrThrow` / `findMany` | `count` / `aggregate` / `groupBy` |
| `create` / `createManyAndReturn` | `createMany` |
| `update` / `updateManyAndReturn` | `updateMany` |
| `upsert` / `delete` | `deleteMany` |

They are not added to `createMany` / `updateMany` / `deleteMany`, which return only counts, nor to the aggregations `count` / `aggregate` / `groupBy`.

## Overriding Existing Fields

If you define a computed field with the same name as an existing field, you can **override** its value.

```ts
const extended = gassma.$extends({
  result: {
    Users: {
      // Replace the existing name with an uppercase version
      name: {
        needs: { name: true },
        compute(user) {
          return user.name.toUpperCase();
        },
      },
    },
  },
});
```

## Dependencies Between Computed Fields

A computed field can depend on another computed field. Put the dependency in `needs`.

```ts
const extended = gassma
  .$extends({
    result: {
      Users: {
        fullName: {
          needs: { firstName: true, lastName: true },
          compute(user) {
            return `${user.firstName} ${user.lastName}`;
          },
        },
      },
    },
  })
  .$extends({
    result: {
      Users: {
        greeting: {
          needs: { fullName: true }, // Depends on another computed field
          compute(user) {
            return `Hi ${user.fullName}`;
          },
        },
      },
    },
  });
```

:::note
For a dependency **across chained `$extends` (a separate `$extends` call)**, the type of the dependency's value is fully applied as well.

On the other hand, if you make computed fields depend on each other **within the same `$extends` call**, it works at runtime, but if the dependency's `compute` has no parameter annotation, the type of the dependency value is **not applied** (it becomes `never`). If you also need the type, add a parameter annotation to the dependency's `compute`, or split them into chained `$extends`. This is a TypeScript limitation, and Prisma behaves the same way.
:::

## Adding to All Models with $allModels

With `$allModels`, you can add a computed field common to all models. If a computed field with the same name is also defined for a specific model, the model-specific one takes precedence.

```ts
const extended = gassma.$extends({
  result: {
    $allModels: {
      fetchedAt: {
        compute() {
          return new Date();
        },
      },
    },
  },
});
```

## Working with select / omit

If you specify `select`, only the **selected computed fields** are included in the result. If you do not specify `select`, all computed fields are included.

```ts
const user = extended.Users.findFirst({
  where: { id: 1 },
  select: { greeting: true }, // Only greeting is returned
});
```

You can also exclude computed fields with `omit`.

```ts
const user = extended.Users.findFirst({
  where: { id: 1 },
  omit: { greeting: true }, // Excludes greeting
});
```

The scalar fields specified in `needs` are read internally for `compute` even if they are not selected with `select` or are excluded with `omit` (compute still works correctly).

## Added to Nested include As Well

Computed fields are also added to related records retrieved with `include`. When nested deeply, they are added to the records at each level.

```ts
const result = extended.Users.findMany({
  include: {
    posts: true, // Each post also gets the computed fields of Posts
  },
});
```

For details on `include`, see [include](/docs/reference/relation/include).

## Combining with query

`query` and `result` can be specified together.

```ts
const extended = gassma.$extends({
  query: {
    Users: {
      findMany({ args, query }) {
        return query(args);
      },
    },
  },
  result: {
    Users: {
      greeting: {
        needs: { name: true },
        compute(user) {
          return `Hi ${user.name}`;
        },
      },
    },
  },
});
```

## Limitations

:::caution
Computed fields cannot be used in `where` / `orderBy` / aggregations (`count` / `aggregate` / `groupBy`). Also, only scalar fields can be specified in `needs` (relations are not allowed).
:::

## Practical Examples

### fullName

Add a `fullName` that joins `firstName` and `lastName` (when the Users sheet has `firstName` / `lastName` columns).

```ts
const extended = gassma.$extends({
  result: {
    Users: {
      fullName: {
        needs: { firstName: true, lastName: true },
        compute(user) {
          return `${user.firstName} ${user.lastName}`;
        },
      },
    },
  },
});

const user = extended.Users.findFirst({ where: { id: 1 } });
user.fullName; // "Alice Smith"
```

### Derived Field

Add a value derived from an existing field.

```ts
const extended = gassma.$extends({
  result: {
    Posts: {
      excerpt: {
        needs: { content: true },
        compute(post) {
          return post.content.slice(0, 20);
        },
      },
    },
  },
});
```
