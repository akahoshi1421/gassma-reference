---
sidebar_position: 2
slug: /reference/crud/create/createMany
---

# createMany()

Used to add multiple rows to the target sheet simultaneously.

## Available Keys

| Key | Description | Optional |
| --- | --- | --- |
| data | Specifies the data to register | Required |

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

// gassma.{{TARGET_SHEET_NAME}}.createMany
const result = gassma.sheet1.createMany({
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
{
  count: 1;
}
```

The number of created rows is returned.

:::note
`createMany` does not support [Nested Write](/docs/reference/relation/nested-write). Use `create` if you need to operate on related records simultaneously.
:::
