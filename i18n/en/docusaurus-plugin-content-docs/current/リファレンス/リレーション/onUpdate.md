---
sidebar_position: 5
slug: /reference/relation/on-update
---

# onUpdate

Defines how related records should be handled when a record's PK (primary key) is changed with `update` / `updateMany` / `updateManyAndReturn`.

## Example Sheets

Uses the sheet examples from [relation definition](/docs/reference/relation/definition).

## Basic Usage

Specify `onUpdate` in the [relation definition](/docs/reference/relation/definition):

```ts
const gassma = new Gassma.GassmaClient({
  relations: {
    Users: {
      posts: {
        type: "oneToMany",
        to: "Posts",
        field: "id",
        reference: "authorId",
        onUpdate: "Cascade",
      },
    },
  },
});
```

## Action Types

| Action | Behavior |
| --- | --- |
| Cascade | Automatically update the FK of related records to the new value |
| SetNull | Set the FK of related records to null |
| Restrict | Prevent the update with an error if related records exist |
| NoAction | Do nothing (default) |

## Cascade

When a parent record's PK is changed, the FK of related child records is automatically updated to the new value:

```ts
const gassma = new Gassma.GassmaClient({
  relations: {
    Users: {
      posts: {
        type: "oneToMany",
        to: "Posts",
        field: "id",
        reference: "authorId",
        onUpdate: "Cascade",
      },
    },
  },
});

// Changing Alice's id from 1 to 10 also updates Posts authorId: 1 to authorId: 10
gassma.Users.updateMany({
  where: { name: "Alice" },
  data: { id: 10 },
});
```

The Posts sheet after update:

| id | title | authorId | published |
| --- | --- | --- | --- |
| 1 | First Post | 10 | true |
| 2 | How to use GAS | 10 | true |
| 3 | Draft Article | 2 | false |

### manyToMany Case

When Cascade is specified for manyToMany, the corresponding column in the **junction table** is updated to the new value:

```ts
relations: {
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
      onUpdate: "Cascade",
    },
  },
}

// Changing post id from 1 to 100 also updates PostTags postId: 1 to postId: 100
gassma.Posts.updateMany({
  where: { id: 1 },
  data: { id: 100 },
});
```

## SetNull

When a parent record's PK is changed, the FK of related child records is updated to `null`:

```ts
const gassma = new Gassma.GassmaClient({
  relations: {
    Users: {
      posts: {
        type: "oneToMany",
        to: "Posts",
        field: "id",
        reference: "authorId",
        onUpdate: "SetNull",
      },
    },
  },
});

// Changing Alice's id sets the authorId of Alice's posts to null
gassma.Users.updateMany({
  where: { name: "Alice" },
  data: { id: 10 },
});
```

The Posts sheet after update:

| id | title | authorId | published |
| --- | --- | --- | --- |
| 1 | First Post | null | true |
| 2 | How to use GAS | null | true |
| 3 | Draft Article | 2 | false |

:::note
When SetNull is specified for manyToMany, nothing happens (because setting the junction table FK to null is meaningless).
:::

## Restrict

If even one related record exists, the update is rejected and an error is thrown:

```ts
const gassma = new Gassma.GassmaClient({
  relations: {
    Users: {
      posts: {
        type: "oneToMany",
        to: "Posts",
        field: "id",
        reference: "authorId",
        onUpdate: "Restrict",
      },
    },
  },
});

// Alice has posts, so changing the id causes an error
gassma.Users.updateMany({
  where: { name: "Alice" },
  data: { id: 10 },
});
// => RelationOnUpdateRestrictError

// Charlie has no posts, so the update proceeds normally
gassma.Users.updateMany({
  where: { name: "Charlie" },
  data: { id: 10 },
});
```

:::tip
Restrict checks are performed **first** for all relations. Therefore, even if an error occurs, side effects (Cascade of other relations, etc.) are not executed.
:::

## NoAction

Does nothing. Same behavior as not specifying `onUpdate`:

```ts
relations: {
  Users: {
    posts: {
      type: "oneToMany",
      to: "Posts",
      field: "id",
      reference: "authorId",
      onUpdate: "NoAction",  // Same as not specifying
    },
  },
}
```

## Combining with onDelete

`onDelete` and `onUpdate` can be specified simultaneously in the same relation definition:

```ts
relations: {
  Users: {
    posts: {
      type: "oneToMany",
      to: "Posts",
      field: "id",
      reference: "authorId",
      onDelete: "Cascade",    // On delete: Posts are also deleted
      onUpdate: "Cascade",    // On PK update: Posts FK is also updated
    },
  },
}
```
