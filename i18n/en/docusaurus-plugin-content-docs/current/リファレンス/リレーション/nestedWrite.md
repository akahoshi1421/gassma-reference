---
sidebar_position: 5
slug: /reference/relation/nested-write
---

# Nested Write (create)

Used to simultaneously create and associate records in relation targets within the `create` method.

Requires a prior [relation definition](/docs/reference/relation/definition).

## Example Sheets

Uses the sheet examples from [relation definition](/docs/reference/relation/definition).

## Available Operations

| Operation | Description |
| --- | --- |
| create | Create a new related record and associate it |
| createMany | Create multiple new related records and associate them |
| connect | Associate an existing related record |
| connectOrCreate | Associate if existing record found, otherwise create and associate |

### Compatibility by Relation Type

| Operation | manyToOne | oneToOne | oneToMany | manyToMany |
| --- | --- | --- | --- | --- |
| create | Single only | Single only | Single/Array | Single/Array |
| createMany | - | - | Supported | - |
| connect | Supported | Supported | Single/Array | Single/Array |
| connectOrCreate | Supported | Supported | Single/Array | Single/Array |

## create

### create with manyToOne

Example of creating a post while also creating the associated author. In manyToOne, this is used in reverse (creating the author from the post side).

```ts
const result = gassma.Posts.create({
  data: {
    id: 4,
    title: "New Article",
    published: true,
    author: {
      create: {
        id: 4,
        name: "Dave",
        email: "dave@example.com",
      },
    },
  },
});
```

Executing the above performs the following:

1. Dave is created in the Users sheet
2. Dave's `id` (= 4) is automatically set as the Posts `authorId`
3. The new article is created in the Posts sheet

The return value has the following format:

```ts
{
  id: 4,
  title: "New Article",
  authorId: 4,
  published: true,
}
```

### create with oneToMany

Create posts simultaneously when creating a user:

```ts
const result = gassma.Users.create({
  data: {
    id: 4,
    name: "Dave",
    email: "dave@example.com",
    posts: {
      create: [
        { id: 4, title: "Dave's Article 1", published: true },
        { id: 5, title: "Dave's Article 2", published: false },
      ],
    },
  },
});
```

Executing the above performs the following:

1. Dave is created in the Users sheet
2. 2 articles are created in the Posts sheet (`authorId` is automatically set to Dave's `id` = 4)

You can also create a single record with an object instead of an array:

```ts
posts: {
  create: { id: 4, title: "Dave's Article", published: true },
}
```

### create with manyToMany

Create tags simultaneously when creating a post, and associate them in the junction table:

```ts
const result = gassma.Posts.create({
  data: {
    id: 4,
    title: "New Article",
    authorId: 1,
    published: true,
    tags: {
      create: { id: 3, name: "TypeScript" },
    },
  },
});
```

Executing the above performs the following:

1. The new article is created in the Posts sheet
2. The "TypeScript" tag is created in the Tags sheet
3. `{ postId: 4, tagId: 3 }` is created in the PostTags sheet

## createMany

Bulk create multiple child records with oneToMany:

```ts
const result = gassma.Users.create({
  data: {
    id: 4,
    name: "Dave",
    email: "dave@example.com",
    posts: {
      createMany: {
        data: [
          { id: 4, title: "Article 1", published: true },
          { id: 5, title: "Article 2", published: false },
        ],
      },
    },
  },
});
```

Dave's `id` is automatically set as `authorId` for each record.

## connect

Associates existing records. Specify the target record with `where` conditions.

### connect with manyToOne

Create a post linked to an existing user:

```ts
const result = gassma.Posts.create({
  data: {
    id: 4,
    title: "New Article",
    published: true,
    author: {
      connect: { name: "Alice" },
    },
  },
});
```

Executing the above performs the following:

1. Search for a record with `name: "Alice"` in the Users sheet
2. Alice's `id` (= 1) is automatically set as the Posts `authorId`
3. The new article is created in the Posts sheet

:::caution
If no record matching the condition is found, `NestedWriteConnectNotFoundError` is thrown.
:::

### connect with oneToMany

Create a user and simultaneously link existing posts:

```ts
const result = gassma.Users.create({
  data: {
    id: 4,
    name: "Dave",
    email: "dave@example.com",
    posts: {
      connect: [
        { title: "Draft Article" },
      ],
    },
  },
});
```

The above updates the `authorId` of "Draft Article" in the Posts sheet to Dave's `id` (= 4).

### connect with manyToMany

Associate existing tags with a post:

```ts
const result = gassma.Posts.create({
  data: {
    id: 4,
    title: "New Article",
    authorId: 1,
    published: true,
    tags: {
      connect: [
        { name: "GAS" },
        { name: "JavaScript" },
      ],
    },
  },
});
```

Executing the above performs the following:

1. The new article is created in the Posts sheet
2. `{ postId: 4, tagId: 1 }` and `{ postId: 4, tagId: 2 }` are created in the PostTags sheet

The records in the Tags sheet are not modified.

## connectOrCreate

Associates if an existing record is found, otherwise creates a new one and associates it:

```ts
const result = gassma.Posts.create({
  data: {
    id: 4,
    title: "New Article",
    published: true,
    author: {
      connectOrCreate: {
        where: { name: "Alice" },
        create: {
          id: 4,
          name: "Alice",
          email: "alice-new@example.com",
        },
      },
    },
  },
});
```

In the above case, since Alice exists in the Users sheet, it behaves the same as connect. If she doesn't exist, a new record is created with the `create` data.

For oneToMany / manyToMany, you can specify multiple with an array:

```ts
tags: {
  connectOrCreate: [
    {
      where: { name: "GAS" },
      create: { id: 3, name: "GAS" },
    },
    {
      where: { name: "New Tag" },
      create: { id: 4, name: "New Tag" },
    },
  ],
}
```

## Deep Nesting

Nested write is processed recursively, so you can create deep relation hierarchies at once.

For example, creating User → Posts → Tags at once:

```ts
const gassma = new Gassma.GassmaClient({
  relations: {
    Users: {
      posts: {
        type: "oneToMany",
        to: "Posts",
        field: "id",
        reference: "authorId",
      },
    },
    Posts: {
      tags: {
        type: "manyToMany",
        to: "Tags",
        field: "id",
        reference: "id",
        through: {
          sheet: "PostTags",
          field: "postId",
          reference: "tagId",
        },
      },
    },
  },
});

const result = gassma.Users.create({
  data: {
    id: 4,
    name: "Dave",
    email: "dave@example.com",
    posts: {
      create: {
        id: 4,
        title: "Dave's Article",
        published: true,
        tags: {
          create: { id: 3, name: "TypeScript" },
        },
      },
    },
  },
});
```

The above is processed in the following order:

1. Dave is created in the Users sheet
2. The article is created in the Posts sheet (`authorId: 4` is automatically set)
3. "TypeScript" is created in the Tags sheet
4. A relation row is created in the PostTags sheet

## Notes

- Nested write is only available in the `create` method. It cannot be used in `createMany` / `updateMany`, etc.
- FK is automatically set, but PK (id, etc.) must be explicitly specified. There is no auto-increment feature.
- If no record matching the `where` condition in `connect` is found, `NestedWriteConnectNotFoundError` is thrown.

## Validation

| Error | Cause |
| --- | --- |
| `NestedWriteWithoutRelationsError` | Used nested write syntax without relation definitions |
| `NestedWriteConnectNotFoundError` | Record not found with `connect` / `connectOrCreate` where condition |
