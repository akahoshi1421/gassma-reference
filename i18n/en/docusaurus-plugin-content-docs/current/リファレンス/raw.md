---
sidebar_position: 12
slug: /reference/raw
description: "Use Gassma.raw to opt out of formula-injection escaping per cell and write a formula as-is"
---

# raw (Writing Formulas)

`Gassma.raw(value)` is a helper that skips the automatic formula-injection escaping for that cell only and writes the value to the sheet **as-is**. When you pass a string starting with `=`, the cell holds a **live spreadsheet formula**.

## Default Protection (Automatic Escaping)

When writing, GASsma escapes any string starting with `=`, `+`, `-`, or `@` by prepending a `'` (single quote). This prevents strings like `=IMPORTRANGE(...)` slipped into form input from being executed as formulas (formula injection).

- Only **strings** are escaped. Numbers, booleans, and Dates are written unchanged. However, `NaN` / `Infinity` / `-Infinity` and invalid Dates (Invalid Date) are rejected with a `GassmaInvalidValueError` before escaping — the write itself fails.
- The `'` does not appear in the spreadsheet's display or when reading, so reading an escaped cell back through GASsma returns the original string (e.g. `"=1+2"`).

Since this protection is always on, it gets in the way when you intentionally want to write an aggregation formula. `Gassma.raw` is the opt-out for that.

## Basic Usage

Wrap a `data` value in `Gassma.raw()` and that cell alone skips escaping. The main use case is writing an aggregation formula into a number column.

```ts
const gassma = new GassmaClient();

gassma.Report.create({
  data: {
    title: userInput, // escaped as usual
    total: Gassma.raw("=SUM(B2:B10)"), // this cell alone is written as a formula
  },
});
```

Within the same write, columns that do not use `Gassma.raw()` (like `title` above) remain protected as before.

It can be used with all `create` and `update` methods (`create` / `createMany` / `createManyAndReturn` / `update` / `updateMany` / `updateManyAndReturn` / `upsert`), and with nested write `create` / `createMany` / `connectOrCreate`'s `create`.

## The Return Value Is Not the Computed Result

The return value of `create` / `update` etc. is an **echo of what was written**. GASsma does not re-read the sheet after writing, so the **computed result of the formula is not returned**. If you write a formula into a number column, the return value is the formula **string**.

```ts
const created = gassma.FormulaCell.create({
  data: { id: 4, label: "delta", amount: 60, total: Gassma.raw("=C5*2") },
});
created.total; // "=C5*2" (the formula string, not the computed result)
```

If you need the computed result, read the record back after writing.

```ts
const readBack = gassma.FormulaCell.findFirstOrThrow({ where: { id: 4 } });
readBack.total; // 120 (the result computed on the cell)
```

## The Effect of raw Is Limited to That One Cell

The effect of `Gassma.raw()` is limited to **the exact cell** it was passed for.

- Other columns in the same row are escaped as usual.
- Other writes referencing a raw cell — such as FK values handed down to child rows in nested writes — are never treated as raw either.

```ts
gassma.FormulaCell.create({
  data: {
    id: 4,
    label: "=1+2", // escaped; stays the literal string "=1+2"
    amount: 60,
    total: Gassma.raw("=C5*2"), // written as a formula and computed on the cell
  },
});
```

## Combining with $transaction

It can also be used inside [$transaction](/docs/reference/transaction). Raw values are written to the sheet together at commit time, and become formulas at that point.

Reads inside the tx before commit (read-your-writes) still see the **formula string**, because nothing has been written to the sheet yet.

```ts
gassma.$transaction((tx) => {
  tx.FormulaCell.create({
    data: { id: 4, label: "delta", amount: 60, total: Gassma.raw("=C5*2") },
  });

  const buffered = tx.FormulaCell.findFirstOrThrow({ where: { id: 4 } });
  buffered.total; // "=C5*2" (not computed yet — before commit)
});

// After commit the cell holds a live formula and the computed result can be read
const readBack = gassma.FormulaCell.findFirstOrThrow({ where: { id: 4 } });
readBack.total; // 120
```

## Types

`Gassma.raw(value: string)` returns a `Gassma.RawValue`.

- In the generated types, **every column** in `data` accepts `Gassma.RawValue`. Since a formula can produce a value of any type on the cell, you can pass it to number, boolean, and Date columns as well.
- It cannot be used in `where`. It is write-only. Passing it as a `where` value throws a `GassmaInvalidValueError` (Expected a scalar value, but received a Gassma.raw value.).

## Never Use It with Untrusted Input

:::danger
**Never pass user input** to `Gassma.raw()`. Because it bypasses the default protection, it makes you vulnerable to formula injection.

```ts
// DANGEROUS: passing form input straight into raw
function onFormSubmit(e) {
  const gassma = new GassmaClient();
  gassma.Answers.create({
    data: {
      // If a malicious user enters "=IMPORTRANGE(...)",
      // it will be executed as a formula
      name: Gassma.raw(e.namedValues["名前"][0]),
    },
  });
}
```

Use `Gassma.raw()` only with **trusted values**, such as fixed formulas you wrote yourself. Pass user input as-is without wrapping it in `Gassma.raw()`, and the default protection applies.
:::
