---
sidebar_position: 4
slug: /reference/relation/on-delete
---

# onDelete

Defines how related records should be handled when records are deleted with `deleteMany`.

## Example Sheets

Uses the sheet examples from [relation definition](/docs/reference/relation/definition).

## Basic Usage

Specify `onDelete` in the [relation definition](/docs/reference/relation/definition):

```ts
const gassma = new Gassma.GassmaClient({
  relations: {
    Users: {
      posts: {
        type: "oneToMany",
        to: "Posts",
        field: "id",
        reference: "authorId",
        onDelete: "Cascade",
      },
    },
  },
});
```

## Action Types

| Action | Behavior |
| --- | --- |
| Cascade | Delete related records together |
| SetNull | Set the FK of related records to null |
| Restrict | Prevent deletion with an error if related records exist |
| NoAction | Do nothing (default) |

## Cascade

When a parent record is deleted, related child records are automatically deleted as well:

```ts
const gassma = new Gassma.GassmaClient({
  relations: {
    Users: {
      posts: {
        type: "oneToMany",
        to: "Posts",
        field: "id",
        reference: "authorId",
        onDelete: "Cascade",
      },
    },
  },
});

// Deleting Alice also deletes all of Alice's posts
gassma.Users.deleteMany({
  where: { name: "Alice" },
});
```

Executing the above deletes Alice from the Users sheet, and also deletes all records in the Posts sheet with `authorId: 1`.

### manyToMany Case

When Cascade is specified for manyToMany, records in the **junction table** are deleted. Records in the target table (relation destination) are not deleted.

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
      onDelete: "Cascade",
    },
  },
}

// Deleting a post also deletes related rows in PostTags (Tags remain)
gassma.Posts.deleteMany({
  where: { id: 1 },
});
```

## SetNull

When a parent record is deleted, the FK of related child records is updated to `null`:

```ts
const gassma = new Gassma.GassmaClient({
  relations: {
    Users: {
      posts: {
        type: "oneToMany",
        to: "Posts",
        field: "id",
        reference: "authorId",
        onDelete: "SetNull",
      },
    },
  },
});

// Deleting Alice sets the authorId of Alice's posts to null
gassma.Users.deleteMany({
  where: { name: "Alice" },
});
```

The Posts sheet after execution:

| id | title | authorId | published |
| --- | --- | --- | --- |
| 1 | First Post | null | true |
| 2 | How to use GAS | null | true |
| 3 | Draft Article | 2 | false |

:::note
When SetNull is specified for manyToMany, nothing happens (because setting the junction table FK to null is meaningless).
:::

## Restrict

If even one related record exists, the deletion is rejected and an error is thrown:

```ts
const gassma = new Gassma.GassmaClient({
  relations: {
    Users: {
      posts: {
        type: "oneToMany",
        to: "Posts",
        field: "id",
        reference: "authorId",
        onDelete: "Restrict",
      },
    },
  },
});

// Alice has posts, so an error is thrown
gassma.Users.deleteMany({
  where: { name: "Alice" },
});
// => RelationOnDeleteRestrictError

// Charlie has no posts, so deletion proceeds normally
gassma.Users.deleteMany({
  where: { name: "Charlie" },
});
```

:::tip
Restrict checks are performed **first** for all relations. Therefore, even if an error occurs, side effects (Cascade of other relations, etc.) are not executed.
:::

## NoAction

Does nothing. Same behavior as not specifying `onDelete`:

```ts
relations: {
  Users: {
    posts: {
      type: "oneToMany",
      to: "Posts",
      field: "id",
      reference: "authorId",
      onDelete: "NoAction",  // Same as not specifying
    },
  },
}
```

## onDelete with Multiple Relations

You can define multiple relations for a single sheet with different onDelete settings:

```ts
relations: {
  Users: {
    posts: {
      type: "oneToMany",
      to: "Posts",
      field: "id",
      reference: "authorId",
      onDelete: "Cascade",    // Posts are deleted together
    },
    profile: {
      type: "oneToOne",
      to: "Profiles",
      field: "id",
      reference: "userId",
      onDelete: "SetNull",    // Profile FK is set to null
    },
  },
}
```
