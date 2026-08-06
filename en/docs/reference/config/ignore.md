
# ignore / ignoreSheets (@ignore / @@ignore)

This is the equivalent of Prisma's `@ignore` (field-level) and `@@ignore` (model-level).

## Schema vs. Constructor

When using the CLI, this setting is written in `schema.prisma`. When using the GAS editor alone, you pass it to the `GassmaClient` constructor (the examples on the rest of this page use the constructor form).

| | How to write it |
| --- | --- |
| Schema (CLI) | `@ignore` / `@@ignore` |
| Constructor ([GAS editor](/docs/reference/gas-editor)) | `ignore: { ... }` / `ignoreSheets: [ ... ]` |

```prisma
model Users {
  id           Int    @id
  name         String
  secretColumn String @ignore
}

model Logs {
  id      Int    @id
  message String

  @@ignore
}
```

For how to write schemas, see [Schema](/docs/reference/schema).

## ignore (Field-Level)

Completely excludes specified fields from all operations.

```ts
const gassma = new Gassma.GassmaClient({
  ignore: {
    Users: ["secretColumn", "internalData"],
  },
});

// Excluded from read results
gassma.Users.findMany({});
// => [{ id: 1, name: "Alice" }] (secretColumn, internalData are not included)

// Also excluded from write data
gassma.Users.create({
  data: { name: "Alice", secretColumn: "xxx" },
});
// => secretColumn is ignored
```

For a single column, you can specify it as a string.

```ts
ignore: {
  Users: "secretColumn",
}
```

### Where Exclusion Applies

- **Read results**: Return values of find / create / update / delete / upsert
- **Write data**: data of create / createMany / upsert
- **where conditions**: Also excluded from where clauses

### Difference from Global omit

| | `ignore` | Global `omit` |
| --- | --- | --- |
| Override | Not possible | Can be disabled with `omit: \{field: false\}` |
| Write exclusion | ✅ | ❌ (read only) |
| where exclusion | ✅ | ❌ |

## ignoreSheets (Model-Level)

Completely excludes specified sheets from the client.

```ts
const gassma = new Gassma.GassmaClient({
  ignoreSheets: ["Logs", "Temp"],
});

// gassma.Logs → undefined (excluded)
// gassma.Users → available as usual
```

For a single sheet, you can specify it as a string.

```ts
ignoreSheets: "Logs",
```

`@@ignore` / `@ignore` only hide things from the client; the sheets and columns themselves are left alone. [migrate / db push](/docs/reference/migrate) keeps them on the list of targets, so they are not deleted even with `--accept-data-loss`. That makes them a way to keep a sheet while hiding it from the client (see [Protecting Sheets You Do Not Want Deleted](/docs/reference/migrate#protecting-sheets-you-do-not-want-deleted)).
