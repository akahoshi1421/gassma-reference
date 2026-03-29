---
sidebar_position: 5
slug: /reference/relation/on-update
---

# onUpdate

`update` / `updateMany` / `updateManyAndReturn` でレコードの PK（主キー）を変更する際、リレーション先のレコードをどう扱うかを定義します。

## 説明例用のシート

[リレーション定義](/docs/reference/relation/definition)のシート例を使用します。

## 基本的な使い方

[リレーション定義](/docs/reference/relation/definition)で `onUpdate` を指定します。

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

## アクションの種類

| アクション | 動作 |
| --- | --- |
| Cascade | 関連レコードの FK を新しい値に自動更新 |
| SetNull | 関連レコードの FK を null にする |
| Restrict | 関連レコードが存在する場合、更新をエラーで阻止 |
| NoAction | 何もしない（デフォルト） |

## Cascade

親レコードの PK を変更すると、関連する子レコードの FK が新しい値に自動的に更新されます。

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

// Alice の id を 1 → 10 に変更すると、Posts の authorId: 1 も authorId: 10 に更新される
gassma.Users.updateMany({
  where: { name: "Alice" },
  data: { id: 10 },
});
```

更新後の Posts シートは以下のようになります。

| id | title | authorId | published |
| --- | --- | --- | --- |
| 1 | 初めての投稿 | 10 | true |
| 2 | GAS の使い方 | 10 | true |
| 3 | 下書き記事 | 2 | false |

### manyToMany の場合

manyToMany で Cascade を指定すると、**中間テーブル**の対応カラムが新しい値に更新されます。

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

// 投稿の id を 1 → 100 に変更すると、PostTags の postId: 1 も postId: 100 に更新される
gassma.Posts.updateMany({
  where: { id: 1 },
  data: { id: 100 },
});
```

## SetNull

親レコードの PK を変更すると、関連する子レコードの FK が `null` に更新されます。

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

// Alice の id を変更すると、Alice の投稿の authorId が null になる
gassma.Users.updateMany({
  where: { name: "Alice" },
  data: { id: 10 },
});
```

更新後の Posts シートは以下のようになります。

| id | title | authorId | published |
| --- | --- | --- | --- |
| 1 | 初めての投稿 | null | true |
| 2 | GAS の使い方 | null | true |
| 3 | 下書き記事 | 2 | false |

:::note
manyToMany で SetNull を指定した場合、何も行われません（中間テーブルの FK を null にしても意味がないため）。
:::

## Restrict

関連するレコードが 1 件でも存在する場合、更新を拒否してエラーをスローします。

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

// Alice は投稿を持っているため、id の変更はエラーになる
gassma.Users.updateMany({
  where: { name: "Alice" },
  data: { id: 10 },
});
// => RelationOnUpdateRestrictError

// Charlie は投稿を持たないため、正常に更新される
gassma.Users.updateMany({
  where: { name: "Charlie" },
  data: { id: 10 },
});
```

:::tip
Restrict のチェックは全てのリレーションに対して**先に**行われます。そのため、エラーが発生しても副作用（他のリレーションの Cascade 等）は実行されません。
:::

## NoAction

何も行いません。`onUpdate` を指定しない場合と同じ動作です。

```ts
relations: {
  Users: {
    posts: {
      type: "oneToMany",
      to: "Posts",
      field: "id",
      reference: "authorId",
      onUpdate: "NoAction",  // 指定しない場合と同じ
    },
  },
}
```

## onDelete との組み合わせ

`onDelete` と `onUpdate` は同じリレーション定義に同時に指定できます。

```ts
relations: {
  Users: {
    posts: {
      type: "oneToMany",
      to: "Posts",
      field: "id",
      reference: "authorId",
      onDelete: "Cascade",    // 削除時: 投稿も一緒に削除
      onUpdate: "Cascade",    // PK更新時: 投稿の FK も更新
    },
  },
}
```
