---
sidebar_position: 2
slug: /reference/relation/include
---

# include

Used to retrieve related data together with `findMany` / `findFirst`.

Requires a prior [relation definition](/docs/reference/relation/definition).

## Example Sheets

Uses the sheet examples from [relation definition](/docs/reference/relation/definition).

## Basic Usage

Specify a relation name in `include` with a value of `true` to retrieve all related data.

```ts
const result = gassma.Users.findMany({
  include: {
    posts: true,
  },
});
```

The return value has the following format:

```ts
[
  {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    posts: [
      { id: 1, title: "First Post", authorId: 1, published: true },
      { id: 2, title: "How to use GAS", authorId: 1, published: true },
    ],
  },
  {
    id: 2,
    name: "Bob",
    email: "bob@example.com",
    posts: [
      { id: 3, title: "Draft Article", authorId: 2, published: false },
    ],
  },
  {
    id: 3,
    name: "Charlie",
    email: "charlie@example.com",
    posts: [],
  },
];
```

The returned shape differs by relation type:

| Relation Type | Returned Shape |
| --- | --- |
| oneToMany | Array |
| manyToMany | Array |
| oneToOne | Single object or `null` |
| manyToOne | Single object or `null` |

### manyToOne Example

```ts
const result = gassma.Posts.findMany({
  include: {
    author: true,
  },
});
```

The return value has the following format:

```ts
[
  {
    id: 1,
    title: "First Post",
    authorId: 1,
    published: true,
    author: { id: 1, name: "Alice", email: "alice@example.com" },
  },
  {
    id: 3,
    title: "Draft Article",
    authorId: 2,
    published: false,
    author: { id: 2, name: "Bob", email: "bob@example.com" },
  },
  // ...
];
```

## include Options

Instead of `true`, you can pass an object to apply conditions to the related data.

### Available Keys

| Key | Description | Optional |
| --- | --- | --- |
| where | Query conditions for related data | Optional |
| orderBy | Sort order for related data | Optional |
| skip | Number of related records to skip | Optional |
| take | Number of related records to retrieve | Optional |
| select | Display settings for related columns | Optional |
| omit | Exclusion settings for related columns | Optional |
| include | Retrieve deeper nested relations | Optional |

### where

Apply conditions to filter related data:

```ts
const result = gassma.Users.findMany({
  include: {
    posts: {
      where: { published: true },
    },
  },
});
```

The return value has the following format:

```ts
[
  {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    posts: [
      { id: 1, title: "First Post", authorId: 1, published: true },
      { id: 2, title: "How to use GAS", authorId: 1, published: true },
    ],
  },
  {
    id: 2,
    name: "Bob",
    email: "bob@example.com",
    posts: [],  // published: false articles are filtered out
  },
  // ...
];
```

### orderBy

Sort related data:

```ts
const result = gassma.Users.findMany({
  include: {
    posts: {
      orderBy: { title: "desc" },
    },
  },
});
```

### skip / take

Paginate related data using `skip` and `take` together:

```ts
const result = gassma.Users.findMany({
  include: {
    posts: {
      orderBy: { id: "asc" },
      skip: 1,
      take: 1,
    },
  },
});
```

The above example orders each user's posts by id ascending, skips the first one, and retrieves only the next one.

:::note
`skip` / `take` are available for oneToMany and manyToMany. They are not applicable to oneToOne / manyToOne as they return a single record.
:::

### select

Specify which columns to retrieve from related data:

```ts
const result = gassma.Users.findMany({
  include: {
    posts: {
      select: { title: true },
    },
  },
});
```

The return value has the following format:

```ts
[
  {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    posts: [
      { title: "First Post" },
      { title: "How to use GAS" },
    ],
  },
  // ...
];
```

### omit

Exclude specific columns from related data:

```ts
const result = gassma.Users.findMany({
  include: {
    posts: {
      omit: { authorId: true },
    },
  },
});
```

:::caution
`select` and `omit` cannot be specified simultaneously.
:::

### Nested include

You can specify `include` within `include` to retrieve deep relation hierarchies.

For example, you can retrieve Users → Posts → Tags in a single query:

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

const result = gassma.Users.findMany({
  include: {
    posts: {
      include: {
        tags: true,
      },
    },
  },
});
```

The return value has the following format:

```ts
[
  {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    posts: [
      {
        id: 1,
        title: "First Post",
        authorId: 1,
        published: true,
        tags: [
          { id: 1, name: "GAS" },
          { id: 2, name: "JavaScript" },
        ],
      },
      {
        id: 2,
        title: "How to use GAS",
        authorId: 1,
        published: true,
        tags: [
          { id: 1, name: "GAS" },
        ],
      },
    ],
  },
  // ...
];
```

:::caution
`select` and `include` cannot be specified simultaneously.
:::

## _count

Retrieve the count of related records.

### Count All Relations

Specify `_count: true` to get the record count for all defined relations:

```ts
const result = gassma.Users.findMany({
  include: {
    _count: true,
  },
});
```

The return value has the following format:

```ts
[
  {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    _count: { posts: 2, profile: 1 },
  },
  {
    id: 2,
    name: "Bob",
    email: "bob@example.com",
    _count: { posts: 1, profile: 0 },
  },
  // ...
];
```

### Count Specific Relations

Use `_count: { select: { ... } }` to specify which relations to count:

```ts
const result = gassma.Users.findMany({
  include: {
    _count: {
      select: { posts: true },
    },
  },
});
```

### Count with where Filter

You can also add conditions to the count target:

```ts
const result = gassma.Users.findMany({
  include: {
    _count: {
      select: {
        posts: {
          where: { published: true },
        },
      },
    },
  },
});
```

The return value has the following format:

```ts
[
  {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    _count: { posts: 2 },  // Only published: true posts are counted
  },
  // ...
];
```

### Combining select and _count

You can combine top-level `select` with `_count`:

```ts
const result = gassma.Users.findMany({
  select: {
    name: true,
    _count: {
      select: { posts: true },
    },
  },
});
```

The return value has the following format:

```ts
[
  { name: "Alice", _count: { posts: 2 } },
  { name: "Bob", _count: { posts: 1 } },
  // ...
];
```

:::note
`_count` supports all relation types (oneToMany / oneToOne / manyToOne / manyToMany).
:::

## Retrieving Multiple Relations Simultaneously

You can retrieve multiple relations in a single query:

```ts
const result = gassma.Users.findMany({
  include: {
    posts: true,
    profile: true,
  },
});
```

## Restrictions on include and select

**Top-level** `select` and `include` cannot be used simultaneously.

```ts
// This will throw an error
gassma.Users.findMany({
  select: { name: true },
  include: { posts: true },
});
```

## Validation

| Error | Cause |
| --- | --- |
| `IncludeWithoutRelationsError` | Used `include` without relation definitions |
| `GassmaIncludeSelectConflictError` | Used `include` and `select` simultaneously at the top level |
| `IncludeSelectOmitConflictError` | Used `select` and `omit` simultaneously within include |
| `IncludeSelectIncludeConflictError` | Used `select` and `include` simultaneously within include |
| `IncludeInvalidOptionTypeError` | Invalid type for include value or option |
| `GassmaRelationNotFoundError` | Specified relation name is not defined |
