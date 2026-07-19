---
sidebar_position: 1
slug: /reference/client-extensions/query
---

# $extends (query)

The `query` component of `$extends` lets you register query hooks that intercept the execution of each operation. It corresponds to Prisma's client extensions (the `query` component of `$extends`). Inside a hook you can rewrite `args`, transform the result, or short-circuit without running the actual operation.

To add computed fields instead, see [$extends (result)](/docs/reference/client-extensions/result).

## Basic Usage

Calling `gassma.$extends({ query: {...} })` returns a **new client** with the hooks applied. The original `gassma` is left unchanged.

```ts
const extended = gassma.$extends({
  query: {
    Users: {
      findMany({ model, operation, args, query }) {
        // You can modify args before running the actual query
        return query(args);
      },
    },
  },
});

const users = extended.Users.findMany();
```

## Hook Shape

A hook is a function that receives `{ model, operation, args, query }`.

| Property | Description |
| --- | --- |
| `model` | The model name of the operation (the sheet's code name) |
| `operation` | The operation name (such as `findMany`) |
| `args` | The arguments passed to the operation |
| `query` | A function that runs the actual operation (or the next hook) |

Calling `query(args)` runs the actual operation with the given `args` and returns its result. Before calling `query`, you can rewrite `args`; you can also transform the return value of `query`, or return your own value without calling `query` to short-circuit.

```ts
const extended = gassma.$extends({
  query: {
    Users: {
      findMany({ args, query }) {
        const result = query(args); // Runs the actual findMany
        return result;
      },
    },
  },
});
```

## Target Operations

Query hooks can be registered for the following 15 operations.

| Category | Operations |
| --- | --- |
| Read | `findFirst` / `findFirstOrThrow` / `findMany` |
| Create | `create` / `createMany` / `createManyAndReturn` |
| Update | `update` / `updateMany` / `updateManyAndReturn` |
| Upsert | `upsert` |
| Delete | `delete` / `deleteMany` |
| Aggregation | `count` / `aggregate` / `groupBy` |

## Structure

`query` is specified in the form "model name → operation name → hook". In addition to a specific model and operation, you can use `$allOperations` to target all operations within a model, and `$allModels` to target all models.

```ts
const extended = gassma.$extends({
  query: {
    // A specific operation on a specific model
    Users: {
      findMany({ args, query }) {
        return query(args);
      },
      // All operations within the model
      $allOperations({ operation, args, query }) {
        return query(args);
      },
    },
    // All models
    $allModels: {
      // A specific operation across all models
      findMany({ model, args, query }) {
        return query(args);
      },
      // All operations across all models
      $allOperations({ model, operation, args, query }) {
        return query(args);
      },
    },
  },
});
```

## Composition Order

When multiple hooks match a single operation, they are not overwritten; instead, **all of them are chained**. The order of the chain is as follows:

- **The earlier an extension is applied, the more outer it is** (the later an extension is applied, the more inner it is, closer to the actual operation).
- Within a single extension, **the more specific a hook is, the more outer it is**. The priority is `model.operation` > `model.$allOperations` > `$allModels.operation` > `$allModels.$allOperations`.

When an outer hook calls `query(args)`, the next inner hook runs, and when the innermost hook calls `query(args)`, the actual operation runs.

```ts
const extended = gassma
  .$extends({
    query: {
      Users: {
        findMany({ args, query }) {
          Logger.log("A: outer");
          return query(args);
        },
      },
    },
  })
  .$extends({
    query: {
      Users: {
        findMany({ args, query }) {
          Logger.log("B: inner");
          return query(args);
        },
      },
    },
  });

extended.Users.findMany();
// Log output: "A: outer" → "B: inner" → the actual findMany
```

## Runs Synchronously

Because it runs on GAS, query hooks are executed **synchronously**. `query(args)` returns the result itself synchronously, not a Promise. No `async` / `await` is needed.

```ts
const extended = gassma.$extends({
  query: {
    Users: {
      findMany({ args, query }) {
        const result = query(args); // The result is returned synchronously
        return result;
      },
    },
  },
});
```

## args Is Passed by Reference

`args` is passed to the hook **by reference** (it is not deep cloned). If you mutate `args` destructively, it also affects the object held by the caller. If you want to modify `args`, we recommend building a new object and passing it to `query`.

```ts
const extended = gassma.$extends({
  query: {
    Users: {
      findMany({ args, query }) {
        // Bad: mutating the passed args directly
        // args.where = { ...args.where, deleted: false };

        // Good: build a new object and pass it
        const nextArgs = Object.assign({}, args, {
          where: Object.assign({}, args.where, { deleted: false }),
        });
        return query(nextArgs);
      },
    },
  },
});
```

## Chainable

`$extends` can be called repeatedly. Each call returns a new client.

```ts
const extended = gassma.$extends(extensionA).$extends(extensionB);
```

## Internal Relations of include Do Not Go Through Hooks

Query hooks only target the **operation invoked at the top level**. The retrieval of related records resolved internally by `include` does not go through the hooks.

```ts
const extended = gassma.$extends({
  query: {
    Posts: {
      findMany({ args, query }) {
        // For include: { posts: true } on Users.findMany,
        // this Posts.findMany hook is not called
        return query(args);
      },
    },
  },
});
```

## Practical Examples

### Soft Delete

Inject a default condition into the `where` of `findMany` to exclude deleted records by default.

```ts
const extended = gassma.$extends({
  query: {
    Users: {
      findMany({ args, query }) {
        const nextArgs = Object.assign({}, args, {
          where: Object.assign({ deleted: false }, args.where),
        });
        return query(nextArgs);
      },
    },
  },
});
```

### Audit Log

Use `$allOperations` under `$allModels` to record logs before and after every operation on every model.

```ts
const extended = gassma.$extends({
  query: {
    $allModels: {
      $allOperations({ model, operation, args, query }) {
        Logger.log(`${model}.${operation} start`);
        const result = query(args);
        Logger.log(`${model}.${operation} done`);
        return result;
      },
    },
  },
});
```
