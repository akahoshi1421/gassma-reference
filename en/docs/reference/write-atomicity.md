
# Write Atomicity and Concurrency

[Nested writes](/docs/reference/relation/nested-write) (such as `posts: { create: [...] }` inside a `create`) and `Cascade` in [onDelete](/docs/reference/relation/on-delete) / [onUpdate](/docs/reference/relation/on-update) **write to multiple sheets** in a single operation. This page explains what these operations guarantee — and what they do not.

## Nothing Is Written on Error

Operations that write to multiple sheets buffer their writes internally and **apply them to the sheets all at once when the whole operation succeeds**. If an error occurs partway through, **not a single row is written**.

```ts
// The child create fails
gassma.Users.create({
  data: {
    id: 4,
    name: "Dave",
    posts: {
      create: [{ id: 4, titel: "..." }], // error: misspelled column
    },
  },
});
// → Error. Nothing is written to Users or Posts
```

This is the same guarantee Prisma provides by wrapping nested writes in an implicit transaction.

## Cases This Guarantee Does Not Cover

### The Spreadsheet API Fails During the Write

If the Google Sheets API fails while the buffered writes are being flushed to the sheets, **the writes made up to that point remain on the sheets**.

Using [$transaction](/docs/reference/transaction) with `rollback: true` (the default) restores the sheets from a backup taken before the write (see [rollback](/docs/reference/transaction#rollback) for details).

### Another Process or Person Modifies the Sheet Mid-Operation

GASsma identifies the rows it updates or deletes **by position (row number)**. If someone else **inserts or deletes rows** between the moment GASsma reads the target rows and the moment it writes, GASsma may **write to a different row than intended**.

```
When GASsma reads:      row 1 Alice / row 2 Bob / row 3 Carol
                        → "update Carol on row 3"

Someone deletes row 1:  row 1 Bob / row 2 Carol

When GASsma writes:     writes to row 3 → now empty, or a different row
```

Because multi-sheet operations buffer their writes, **the window between reading and writing is longer** for them. Keep this in mind in environments where writes can happen concurrently.

## Wrap Writes in $transaction When Concurrent Writes Are Possible

In a system where writes can happen concurrently, wrap them in [$transaction](/docs/reference/transaction).

```ts
gassma.$transaction((tx) => {
  tx.Users.create({
    data: {
      id: 4,
      name: "Dave",
      posts: {
        create: [{ id: 4, title: "Dave's post", published: true }],
      },
    },
  });
});
```

`$transaction` acquires a lock, so **writes that use the same lock are serialized with each other**. The default lock is [your own script project's](/docs/reference/transaction#lock), so the read-then-write window described above can no longer be interrupted by a GASsma write from the same project.

This lock only serializes **operations that share the same lock**. It has no effect on:

- **a person editing the spreadsheet by hand**
- **another script writing to the sheet without GASsma**
- **a different GAS project touching the same spreadsheet** (by default each project gets its own lock, so they do not stop each other)

GASsma cannot do anything about the first two. If the sheets may be edited by hand while your operations run, the protection has to come from the design side — for example, **arranging things so the sheets are simply not touched concurrently**, or **running your operations during hours when edits are not accepted**. For the third, you can choose the lock granularity with `GassmaClient`'s [`lock`](/docs/reference/transaction#lock).
