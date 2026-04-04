---
sidebar_position: 3
slug: /reference/crud/create/createManyAndReturn
---

# createManyAndReturn()

Used to add multiple rows to the target sheet simultaneously and retrieve all created records as an array.

Performs the same write operation as `createMany`, but differs in the return value.

## Available Keys

| Key | Description | Optional | Notes |
| --- | --- | --- | --- |
| data | Specifies the data to register | Required | |
| select | Display settings for return value columns | Optional | Cannot be used with `omit` / `include` |
| omit | Exclusion settings for return value columns | Optional | Cannot be used with `select` |
| include | Retrieve related records | Optional | [Details here](/docs/reference/relation/include) |

## Example Sheet

![Example Sheet](../../img/exampleSheet.png)

## Description

Suppose you want to add the following rows to the above example:

- Row 1

  - name => **Shibata**
  - age => **23**
  - pref => **Shimane**
  - postNumber => **690-8540**

- Row 2
  - name => **Suzuhara**
  - age => **25**
  - pref => **Tottori**
  - postNumber => **680-8571**

The code would be:

```ts
const gassma = new Gassma.GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.createManyAndReturn
const result = gassma.sheet1.createManyAndReturn({
  data: [
    {
      name: "Shibata",
      age: 23,
      pref: "Shimane",
      postNumber: "690-8540",
    },
    {
      name: "Suzuhara",
      age: 25,
      pref: "Tottori",
      postNumber: "680-8571",
    },
  ],
});
```

The return value has the following format:

```ts
[
  { name: "Shibata", age: 23, pref: "Shimane", postNumber: "690-8540" },
  { name: "Suzuhara", age: 25, pref: "Tottori", postNumber: "680-8571" },
];
```

All created records are returned as an array.

## Differences from createMany

| Method | Return Value |
| --- | --- |
| `createMany` | `{ count: number }` |
| `createManyAndReturn` | Array of created records |

The behavior also differs when passing an empty array:

```ts
// createMany
gassma.sheet1.createMany({ data: [] });
// => undefined

// createManyAndReturn
gassma.sheet1.createManyAndReturn({ data: [] });
// => []
```

Fields not specified in data are returned as `null`:

```ts
const result = gassma.sheet1.createManyAndReturn({
  data: [{ name: "Shibata" }],
});
// => [{ name: "Shibata", age: null, pref: null, postNumber: null }]
```

:::note
`createManyAndReturn` does not support [Nested Write](/docs/reference/relation/nested-write). Use `create` if you need to operate on related records simultaneously.
:::
