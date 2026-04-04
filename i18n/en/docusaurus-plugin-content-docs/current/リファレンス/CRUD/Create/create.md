---
sidebar_position: 1
slug: /reference/crud/create/create
---

# create()

Used to add a new single row to the target sheet.

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

Suppose you want to add the following row to the above example:

- name => **Shibata**
- age => **23**
- pref => **Shimane**
- postNumber => **690-8540**

The code would be:

```ts
const gassma = new Gassma.GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.create
const result = gassma.sheet1.create({
  data: {
    name: "Shibata",
    age: 23,
    pref: "Shimane",
    postNumber: "690-8540",
  },
});
```

The return value has the following format:

```ts
{
  name: 'Shibata',
  age: 23,
  pref: 'Shimane',
  postNumber: '690-8540'
}
```

The data of the created row is returned.

Also, if you omit the age as follows, the `age` column of that row will be empty:

```ts
const gassma = new Gassma.GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.create
gassma.sheet1.create({
  data: {
    name: "Shibata",
    pref: "Shimane",
    postNumber: "690-8540",
  },
});
```

The return value has the following format:

```ts
{
  name: 'Shibata',
  age: null,
  pref: 'Shimane',
  postNumber: '690-8540'
}
```

## Nested Write

When relation definitions exist, you can describe operations to simultaneously create and associate records in relation targets within `data`.

For details, see the [Nested Write reference](/docs/reference/relation/nested-write).
