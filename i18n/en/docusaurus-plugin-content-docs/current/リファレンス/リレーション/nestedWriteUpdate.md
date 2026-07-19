---
sidebar_position: 6
slug: /reference/relation/nested-write-update
description: "Modify related records inside update using update/delete/deleteMany/disconnect/set"
---

# Nested Write (update)

You can simultaneously operate on related records within the `data` of the `update` method.

In addition to the operations available in [create's Nested Write](/docs/reference/relation/nested-write), `update` / `delete` / `deleteMany` / `disconnect` / `set` operations are available.

## Example Sheets

Uses the sheet examples from [relation definition](/docs/reference/relation/definition).

## Available Operations

| Operation | manyToOne / oneToOne | oneToMany | manyToMany |
| --- | --- | --- | --- |
| create | Single only | Single / Array | Single / Array |
| createMany | - | Supported | - |
| connect | Supported | Single / Array | Single / Array |
| connectOrCreate | Supported | Single / Array | Single / Array |
| update | Supported | Single / Array | - |
| delete | Supported | Single / Array | - |
| deleteMany | - | Single / Array | - |
| disconnect | Supported | Single / Array | Single / Array |
| set | - | Supported | Supported |

:::note
manyToOne and oneToOne accept the same operation shapes but behave differently. manyToOne (FK-holding side) operates on the **own record's FK**, while oneToOne (non-FK side) operates on the **related record holding the FK** (see [relation definition](/docs/reference/relation/definition)).
:::

### Behavior of oneToOne (Non-FK Side)

| Operation | Behavior | When the target record does not exist |
| --- | --- | --- |
| create | Creates the related record with the FK automatically set | - |
| connect | Replaces (nulls the FK of the currently connected record, then sets the target record's FK to the parent) | `NestedWriteConnectNotFoundError` |
| connectOrCreate | Same replacement as connect if found, otherwise creates with the FK automatically set | - |
| update | Updates the related record (specify data directly) | `NestedWriteTargetNotFoundError` |
| disconnect: true | Nulls the FK of the related record | Does nothing |
| delete: true | Deletes the related record | `NestedWriteTargetNotFoundError` |

Specifying `set` / `deleteMany` / `createMany` / array forms results in `NestedWriteInvalidOperationError`.

## create

Creates a new related record and associates it. Same behavior as [create's Nested Write](/docs/reference/relation/nested-write).

```ts
// oneToMany: Create a new post when updating a user
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      create: { id: 4, title: "New Post", published: true },
    },
  },
});
```

## connect

Associates an existing related record:

```ts
// manyToOne: Change the post's author to an existing user
gassma.Posts.update({
  where: { id: 1 },
  data: {
    author: {
      connect: { name: "Bob" },
    },
  },
});
```

With oneToOne (non-FK side), connect behaves as a **replacement**. The FK of the currently connected related record is set to `null`, then the target record's FK is set to the parent:

```ts
// oneToOne: Replace the user's profile with another profile
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    profile: {
      connect: { id: 2 },
    },
  },
});
// => After the userId of Profiles id: 1 (currently connected) becomes null,
//    the userId of id: 2 is updated to Alice's id (= 1)
```

## connectOrCreate

Associates if existing record found, otherwise creates and associates:

```ts
// manyToOne: Connect to author if exists, otherwise create
gassma.Posts.update({
  where: { id: 1 },
  data: {
    author: {
      connectOrCreate: {
        where: { name: "Dave" },
        create: { id: 4, name: "Dave", email: "dave@example.com" },
      },
    },
  },
});
```

## update

Updates related records.

### manyToOne (FK-Holding Side)

Specify the update data directly. The record referenced by the own record's FK is updated:

```ts
// manyToOne: Update the post's author name
gassma.Posts.update({
  where: { id: 1 },
  data: {
    author: {
      update: { name: "Alice Updated" },
    },
  },
});
```

### oneToOne (Non-FK Side)

Likewise, specify the update data directly. The related record referencing the parent is updated:

```ts
// oneToOne: Update the user's profile
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    profile: {
      update: { bio: "Updated bio" },
    },
  },
});
```

:::caution
If no connected related record exists, `NestedWriteTargetNotFoundError` is thrown.
:::

### oneToMany

Specify `where` and `data` to narrow down the update target. Multiple specifications with arrays are also possible:

```ts
// oneToMany: Update a specific post
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      update: {
        where: { id: 1 },
        data: { title: "Updated Title" },
      },
    },
  },
});

// Update multiple posts simultaneously
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      update: [
        { where: { id: 1 }, data: { title: "Title A" } },
        { where: { id: 2 }, data: { title: "Title B" } },
      ],
    },
  },
});
```

## delete

Deletes related records.

### manyToOne (FK-Holding Side)

Specify `delete: true` to delete the related record and set the own FK to `null`:

```ts
// manyToOne: Delete the post's author (post's authorId becomes null)
gassma.Posts.update({
  where: { id: 1 },
  data: {
    author: { delete: true },
  },
});
```

### oneToOne (Non-FK Side)

Specify `delete: true` to delete the related record referencing the parent. The own record is not modified:

```ts
// oneToOne: Delete the user's profile
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    profile: { delete: true },
  },
});
// => The record with userId: 1 in Profiles is deleted
```

:::caution
If no connected related record exists, `NestedWriteTargetNotFoundError` is thrown.
:::

### oneToMany

Specify `where` conditions to narrow down deletion targets. Multiple specifications with arrays are also possible:

```ts
// oneToMany: Delete a specific post
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      delete: { id: 3 },
    },
  },
});

// Delete multiple
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      delete: [{ id: 2 }, { id: 3 }],
    },
  },
});
```

## deleteMany

Bulk deletes related records matching conditions. Only available for oneToMany:

```ts
// oneToMany: Delete all unpublished posts
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      deleteMany: { published: false },
    },
  },
});

// Delete with multiple conditions
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      deleteMany: [
        { published: false },
        { title: "Draft" },
      ],
    },
  },
});
```

## disconnect

Removes the relation association. The record itself is not deleted.

### manyToOne (FK-Holding Side)

Specify `disconnect: true` to set the own FK to `null`:

```ts
// manyToOne: Remove the association between post and author
gassma.Posts.update({
  where: { id: 1 },
  data: {
    author: { disconnect: true },
  },
});
// => Posts authorId becomes null
```

### oneToOne (Non-FK Side)

Specify `disconnect: true` to set the FK of the related record referencing the parent to `null`:

```ts
// oneToOne: Remove the association between user and profile
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    profile: { disconnect: true },
  },
});
// => The userId: 1 in Profiles becomes null
```

If no connected record exists, nothing happens (no error is thrown).

### oneToMany

Specify `where` conditions to set the FK of related records to `null`:

```ts
// oneToMany: Remove association for specific posts
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      disconnect: { id: 1 },
    },
  },
});
// => Posts id: 1 authorId becomes null

// Remove multiple associations
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      disconnect: [{ id: 1 }, { id: 2 }],
    },
  },
});
```

### manyToMany

Deletes the junction table records:

```ts
// manyToMany: Remove tag association
gassma.Posts.update({
  where: { id: 1 },
  data: {
    tags: {
      disconnect: { id: 3 },
    },
  },
});
// => The corresponding record is deleted from the PostTags table
```

## set

Replaces all relation associations. Only available for oneToMany and manyToMany.

### oneToMany

Sets all child records' FK to `null`, then sets the FK of specified records to the parent:

```ts
// oneToMany: Replace Alice's posts with only id: 1 and id: 2
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    posts: {
      set: [{ id: 1 }, { id: 2 }],
    },
  },
});
// => All existing posts' authorId becomes null, then
//    id: 1 and id: 2's authorId is set to Alice's id
```

### manyToMany

Deletes all junction table records, then creates new associations with specified records:

```ts
// manyToMany: Completely replace post tags
gassma.Posts.update({
  where: { id: 1 },
  data: {
    tags: {
      set: [{ id: 10 }, { id: 11 }],
    },
  },
});
// => All records for post id: 1 are deleted from PostTags, then
//    new association records are created
```

## Combining Multiple Operations

You can combine multiple relation operations within a single update:

```ts
gassma.Users.update({
  where: { name: "Alice" },
  data: {
    name: "Alice Updated",
    posts: {
      create: { id: 5, title: "New Article", published: true },
      update: { where: { id: 1 }, data: { title: "Updated" } },
      delete: { id: 3 },
    },
  },
});
```

## Errors

| Error | Cause |
| --- | --- |
| `NestedWriteWithoutRelationsError` | Executed Nested Write without relation definitions |
| `NestedWriteInvalidOperationError` | Specified an operation not supported for the relation type |
| `NestedWriteConnectNotFoundError` | Target record not found for connect / connectOrCreate |
| `NestedWriteTargetNotFoundError` | No related record exists for update / delete on the non-FK side of a oneToOne |
