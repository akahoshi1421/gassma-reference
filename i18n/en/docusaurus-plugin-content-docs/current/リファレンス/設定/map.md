---
sidebar_position: 6
slug: /reference/config/map
---

# map / mapSheets (@map / @@map)

This is the equivalent of Prisma's `@map("name")` (field-level) and `@@map("name")` (model-level). It maps names in your code to names in the spreadsheet.

## map (Field-Level)

Maps field names in your code to different header names in the spreadsheet.

```ts
const gassma = new Gassma.GassmaClient({
  map: {
    Users: {
      firstName: "名前",
      lastName: "名字",
    },
  },
});

// Use English names in your code
gassma.Users.create({
  data: { firstName: "Alice", lastName: "Smith" },
});
// → Written to the "名前" and "名字" columns in the spreadsheet

gassma.Users.findFirst({
  where: { firstName: "Alice" },
});
// => \{ firstName: "Alice", lastName: "Smith" \}
```

### Where Conversion Applies

- **Write data**: Converts code names to header names in create / createMany / update / updateMany / upsert
- **Read results**: Converts header names to code names in return values of find / create / update / upsert
- **where conditions**: Converts code names to header names before filtering

## mapSheets (Model-Level)

Maps model names in your code to sheet names in the spreadsheet.

```ts
const gassma = new Gassma.GassmaClient({
  mapSheets: {
    Users: "ユーザー一覧",
    Posts: "投稿データ",
  },
});

// Access using English names in your code
gassma.Users.findMany({});
// → Internally operates on the sheet named "ユーザー一覧"
```

### Combining with Other Options

When `mapSheets` is specified, other options (`omit`, `defaults`, `updatedAt`, `ignore`, `map`, etc.) should use the code names.

```ts
const gassma = new Gassma.GassmaClient({
  mapSheets: {
    Users: "ユーザー一覧",
  },
  defaults: {
    Users: { role: "USER" },  // ← Use "Users", not "ユーザー一覧"
  },
});
```
