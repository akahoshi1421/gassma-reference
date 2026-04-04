---
sidebar_position: 5
slug: /reference/config/ignore
---

# ignore / ignoreSheets (@ignore / @@ignore)

This is the equivalent of Prisma's `@ignore` (field-level) and `@@ignore` (model-level).

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
