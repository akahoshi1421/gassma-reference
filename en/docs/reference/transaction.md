
# $transaction (Transactions)

`$transaction` lets you run multiple operations together as a single transaction. It corresponds to Prisma's interactive transactions (the callback form of `$transaction`).

Write operations inside the callback are not applied to the sheets immediately; they are **written to the sheets all at once when the callback finishes successfully** (commit). If the callback throws, **not a single cell is written** to the sheets.

## Basic Usage

Call it as `gassma.$transaction((tx) => {...})`. The callback receives a transaction client `tx`, and the callback's return value is returned as the return value of `$transaction`.

```ts
const user = gassma.$transaction((tx) => {
  const created = tx.Users.create({
    data: { id: 1, name: "Tanaka" },
  });
  tx.Posts.create({
    data: { id: 10, title: "Hello", authorId: created.id },
  });
  return created;
});
// Users and Posts are written together once the callback finishes successfully
```

Because it runs on GAS, unlike Prisma, `$transaction` executes **synchronously**. Neither the callback nor the return value of `$transaction` is a Promise. No `async` / `await` is needed.

## Cancel Everything with throw

If an error is thrown in the middle of the callback, all writes so far are discarded and nothing is applied to the sheets.

```ts
try {
  gassma.$transaction((tx) => {
    tx.Users.create({ data: { id: 1, name: "Tanaka" } });
    tx.Posts.create({ data: { id: 10, title: "Hello", authorId: 1 } });
    throw new Error("cancel");
  });
} catch (e) {
  // Not a single row has been written to Users or Posts
}
```

## The tx Client

`tx` exposes the same models (sheets) as the regular client. `$extends` is also available, letting you build an extended client that applies only within the transaction.

```ts
gassma.$transaction((tx) => {
  const extended = tx.$extends({
    query: {
      Users: {
        findMany({ args, query }) {
          return query(args);
        },
      },
    },
  });
  return extended.Users.findMany();
});
```

On the other hand, `tx` has no `$transaction` (it does not exist on the type either). Nested transactions are not supported; calling `$transaction` inside a transaction throws `GassmaNestedTransactionError`.

### Reads Inside a Transaction (read-your-writes)

Reads inside a transaction (`findMany` / `include` / relation filters, etc.) **see the uncommitted changes**. Clients outside the transaction, on the other hand, do not see the changes until they are committed.

```ts
gassma.$transaction((tx) => {
  tx.Users.create({ data: { id: 1, name: "Tanaka" } });

  // Reads inside tx see the uncommitted changes
  const found = tx.Users.findFirst({ where: { id: 1 } }); // found

  // Clients outside tx do not see them until commit
  const outside = gassma.Users.findFirst({ where: { id: 1 } }); // null
});
```

## Options

Options can be passed as the second argument.

```ts
gassma.$transaction(
  (tx) => {
    // ...
  },
  { maxWait: 10000, timeout: 120000, rollback: false },
);
```

| Option | Default | Description |
| --- | --- | --- |
| `maxWait` | `20000` (ms) | Maximum time to wait for the transaction to start (lock acquisition). Throws `GassmaTransactionLockTimeoutError` when exceeded |
| `timeout` | `60000` (ms) | Maximum execution time for the whole transaction. Throws `GassmaTransactionTimeoutError` when exceeded |
| `rollback` | `true` | Whether to enable the commit-time backup and automatic restore on failure (see [below](#rollback)) |

### maxWait

A transaction starts only after acquiring a script lock. If another execution holds the same lock (such as another running `$transaction`), it waits up to `maxWait` milliseconds for the lock to be released, and throws `GassmaTransactionLockTimeoutError` if it still cannot be acquired.

### timeout

When the elapsed time since the transaction started exceeds `timeout` milliseconds, `GassmaTransactionTimeoutError` is thrown. The check is cooperative: the elapsed time is checked **when each tx operation is called** and **right before commit**.

Because the check is cooperative, an overrun cannot be detected in the middle of code that does not call tx methods (such as a long computation loop). Even in that case, it is detected at the next tx operation or at the check right before commit.

### rollback

With `rollback: true` (the default), a commit proceeds as follows.

1. Duplicate the sheets to be written into temporary backups (hidden sheets named `_gassma_tx_...`)
2. Write to the sheets
3. On success, automatically delete the backups

If the write fails partway through, the sheets are **automatically restored from the backups** and the original error is re-thrown. The sheets are restored on the spot, and formula cells are preserved. If even the restore fails, `GassmaTransactionRollbackError` is thrown **with the backup sheets left in place**. The error's `backupSheetNames` property contains the list of remaining backup sheet names, from which you can recover manually.

Specifying `{ rollback: false }` skips this mechanism entirely (faster). However, if the write fails partway through, the sheets may be left in a partially written state.

With `rollback` enabled, the cost of duplicating the backups (`copyTo`) is **proportional to the size of the sheets being written**, and it also consumes GAS's 6-minute execution limit. For transactions on large sheets or high-frequency transactions, consider `rollback: false`.

## Limitations

- The lock only serializes work that goes through GASsma. It cannot stop manual edits to the spreadsheet or changes from other scripts that do not use GASsma. See [Write Atomicity and Concurrency](/docs/reference/write-atomicity) for what can happen under concurrent access.
- **The lock belongs to the GASsma library, not to your project.** GASsma runs as a library, so the lock `$transaction` takes is the library's own and is shared with every script project that uses GASsma. If a transaction is running in someone else's project, yours waits for it.
- If the execution is forcibly terminated (such as by GAS's 6-minute execution limit), backup sheets may be left behind. A warning is logged the next time `$transaction` runs. Leftover `_gassma_tx_...` sheets can be deleted manually after checking their contents.
- Only cell values and formulas are restored (formatting and the like are not).
- Settings changed at runtime with [changeSettings](/docs/reference/settings/changeSettings) are not carried over into the transaction.
- The form that takes an array of operations (Prisma's sequential operations) is not supported. Only the callback form is available.
- `isolationLevel` is not supported (execution is always serialized by the lock).

## Related Errors

For details on `GassmaTransactionLockTimeoutError` / `GassmaTransactionTimeoutError` / `GassmaNestedTransactionError` / `GassmaTransactionRollbackError`, see the [Error List](/docs/reference/errors).
