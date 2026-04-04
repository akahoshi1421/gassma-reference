---
sidebar_position: 0
slug: /reference/crud/delete/delete
---

# delete()

Deletes the **first row** matching the specified conditions and retrieves the deleted record. Returns `null` if no matching record is found.

## Available Keys

| Key | Description | Optional | Notes |
| --- | --- | --- | --- |
| where | Specifies deletion conditions | Required | |
| select | Display settings for return value columns | Optional | Cannot be used with `include` |
| omit | Exclusion settings for return value columns | Optional | Cannot be used with `select` |
| include | Retrieve related records | Optional | [Details here](/docs/reference/relation/include) |

## Example Sheet

![Example Sheet](../../img/exampleSheet.png)

## Description

Suppose you want to perform the following operation on the above example:

- Delete the row where name is **akahoshi**

The code would be:

```ts
const gassma = new Gassma.GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.delete
const result = gassma.sheet1.delete({
  where: {
    name: "akahoshi",
  },
});
```

The return value has the following format:

```ts
{
  name: 'akahoshi',
  age: 22,
  pref: 'Ibaraki',
  postNumber: '310-8555'
}
```

The deleted record is returned.

If no matching record is found, `null` is returned:

```ts
const result = gassma.sheet1.delete({
  where: { name: "nonexistent" },
});
// => null
```

Even if multiple records match the condition, **only the first one** is deleted.

## select / omit

You can control the fields in the return value:

```ts
const result = gassma.sheet1.delete({
  where: { name: "akahoshi" },
  select: { name: true, age: true },
});
// => { name: "akahoshi", age: 22 }
```

## onDelete

When `onDelete` is configured in relation definitions, the referential action is also executed on `delete`.

For details, see the [onDelete reference](/docs/reference/relation/on-delete).

The `where` specification follows [findMany()](../read/findMany).
