---
sidebar_position: 3
slug: /reference/relation/where-relation-filter
description: "Filter by related records using some/every/none (list relations) and is/isNot (single relations)"
---

# where Relation Filter

Used to filter based on related data within `where` conditions.

Requires a prior [relation definition](/docs/reference/relation/definition).

## Example Sheets

Uses the sheet examples from [relation definition](/docs/reference/relation/definition).

## Supported Methods

where relation filters can be used with all the following methods:

- `findMany` / `findFirst`
- `update` / `updateMany` / `deleteMany`
- `aggregate` / `count` / `groupBy`

## Filter Types

Available filters differ by relation type:

| Filter | oneToMany | manyToMany | oneToOne | manyToOne |
| --- | --- | --- | --- | --- |
| some | Available | Available | - | - |
| every | Available | Available | - | - |
| none | Available | Available | - | - |
| is | - | - | Available | Available |
| isNot | - | - | Available | Available |

## List Relation Filters (oneToMany / manyToMany)

### some

Retrieves records where **at least one** related record matches the condition.

Example: Get users who have at least one published post

```ts
const result = gassma.Users.findMany({
  where: {
    posts: {
      some: { published: true },
    },
  },
});
```

The return value has the following format:

```ts
[
  { id: 1, name: "Alice", email: "alice@example.com" },
];
```

Alice is retrieved because she has published posts. Bob only has `published: false` posts, and Charlie has no posts, so they are excluded.

### every

Retrieves records where **all** related records match the condition. Records with 0 related records are also treated as matching.

Example: Get users whose all posts are published

```ts
const result = gassma.Users.findMany({
  where: {
    posts: {
      every: { published: true },
    },
  },
});
```

The return value has the following format:

```ts
[
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 3, name: "Charlie", email: "charlie@example.com" },
];
```

Alice is retrieved because all her posts are `published: true`. Charlie is retrieved because he has 0 posts (= all satisfy the condition).

### none

Retrieves records where **not a single** related record matches the condition.

Example: Get users who have no published posts

```ts
const result = gassma.Users.findMany({
  where: {
    posts: {
      none: { published: true },
    },
  },
});
```

The return value has the following format:

```ts
[
  { id: 2, name: "Bob", email: "bob@example.com" },
  { id: 3, name: "Charlie", email: "charlie@example.com" },
];
```

## Single Relation Filters (oneToOne / manyToOne)

### is

Retrieves records where the related record matches the condition. Specifying `null` retrieves records where no related record exists.

Example: Get posts whose author name is "Alice"

```ts
const result = gassma.Posts.findMany({
  where: {
    author: {
      is: { name: "Alice" },
    },
  },
});
```

The return value has the following format:

```ts
[
  { id: 1, title: "First Post", authorId: 1, published: true },
  { id: 2, title: "How to use GAS", authorId: 1, published: true },
];
```

### is: null

Retrieves records where no related record exists. For `manyToOne` (the FK-holding side), this matches records whose FK is null; for `oneToOne` (the side without the FK), this matches records for which **no related record exists**.

Example: Get posts whose author (the FK `authorId`) is null

```ts
const result = gassma.Posts.findMany({
  where: {
    author: {
      is: null,
    },
  },
});
```

Example: Get users who have no profile (`oneToOne` on the non-FK side)

```ts
const result = gassma.Users.findMany({
  where: {
    profile: {
      is: null,
    },
  },
});
```

The return value has the following format:

```ts
[
  { id: 3, name: "Charlie", email: "charlie@example.com" },
];
```

### isNot

Retrieves records where the related record does **not** match the condition. Specifying `null` retrieves records where a related record exists.

Example: Get posts whose author is not "Alice"

```ts
const result = gassma.Posts.findMany({
  where: {
    author: {
      isNot: { name: "Alice" },
    },
  },
});
```

The return value has the following format:

```ts
[
  { id: 3, title: "Draft Article", authorId: 2, published: false },
];
```

### isNot: null

Retrieves records where a related record exists. For `manyToOne` (the FK-holding side), this matches records whose FK is not null; for `oneToOne` (the side without the FK), this matches records for which **a related record exists**.

```ts
const result = gassma.Posts.findMany({
  where: {
    author: {
      isNot: null,
    },
  },
});
```

## Combining with AND / OR / NOT

Relation filters can be freely combined with AND / OR / NOT.

### Combining with OR

Example: Get users who have published posts OR whose name is "Charlie"

```ts
const result = gassma.Users.findMany({
  where: {
    OR: [
      { posts: { some: { published: true } } },
      { name: "Charlie" },
    ],
  },
});
```

### Combining with NOT

Example: Get users who don't have any draft articles

```ts
const result = gassma.Users.findMany({
  where: {
    NOT: {
      posts: { some: { published: false } },
    },
  },
});
```

## Usage Examples Beyond findMany / findFirst

### updateMany

Update email addresses of users who have published posts:

```ts
gassma.Users.updateMany({
  where: {
    posts: { some: { published: true } },
  },
  data: {
    email: "updated@example.com",
  },
});
```

### count

Count users who have published posts:

```ts
const count = gassma.Users.count({
  where: {
    posts: { some: { published: true } },
  },
});
```

## Validation

| Error | Cause |
| --- | --- |
| `WhereRelationWithoutContextError` | Used relation filter syntax without relation definitions |
| `WhereRelationInvalidFilterError` | Used list filters (some/every/none) on oneToOne/manyToOne, or used single filters (is/isNot) on oneToMany/manyToMany |
