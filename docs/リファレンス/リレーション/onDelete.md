---
sidebar_position: 4
slug: /reference/relation/on-delete
---

# onDelete

`deleteMany` でレコードを削除する際、リレーション先のレコードをどう扱うかを定義します。

## 説明例用のシート

[リレーション定義](/docs/reference/relation/definition)のシート例を使用します。

## 基本的な使い方

[リレーション定義](/docs/reference/relation/definition)で `onDelete` を指定します。

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

## アクションの種類

| アクション | 動作 |
| --- | --- |
| Cascade | 関連レコードも一緒に削除 |
| SetNull | 関連レコードの FK を null にする |
| Restrict | 関連レコードが存在する場合、削除をエラーで阻止 |
| NoAction | 何もしない（デフォルト） |

## Cascade

親レコードを削除すると、関連する子レコードも自動的に削除されます。

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

// Alice を削除すると、Alice の投稿も全て削除される
gassma.Users.deleteMany({
  where: { name: "Alice" },
});
```

上記を実行すると、Users シートから Alice が削除されるのに加えて、Posts シートの `authorId: 1` のレコードも全て削除されます。

### manyToMany の場合

manyToMany で Cascade を指定すると、**中間テーブル**のレコードが削除されます。ターゲットテーブル（リレーション先）のレコードは削除されません。

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

// 投稿を削除すると、PostTags の関連行が削除される（Tags は残る）
gassma.Posts.deleteMany({
  where: { id: 1 },
});
```

## SetNull

親レコードを削除すると、関連する子レコードの FK が `null` に更新されます。

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

// Alice を削除すると、Alice の投稿の authorId が null になる
gassma.Users.deleteMany({
  where: { name: "Alice" },
});
```

実行後の Posts シートは以下のようになります。

| id | title | authorId | published |
| --- | --- | --- | --- |
| 1 | 初めての投稿 | null | true |
| 2 | GAS の使い方 | null | true |
| 3 | 下書き記事 | 2 | false |

:::note
manyToMany で SetNull を指定した場合、何も行われません（中間テーブルの FK を null にしても意味がないため）。
:::

## Restrict

関連するレコードが 1 件でも存在する場合、削除を拒否してエラーをスローします。

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

// Alice は投稿を持っているため、エラーがスローされる
gassma.Users.deleteMany({
  where: { name: "Alice" },
});
// => RelationOnDeleteRestrictError

// Charlie は投稿を持たないため、正常に削除される
gassma.Users.deleteMany({
  where: { name: "Charlie" },
});
```

:::tip
Restrict のチェックは全てのリレーションに対して**先に**行われます。そのため、エラーが発生しても副作用（他のリレーションの Cascade 等）は実行されません。
:::

## NoAction

何も行いません。`onDelete` を指定しない場合と同じ動作です。

```ts
relations: {
  Users: {
    posts: {
      type: "oneToMany",
      to: "Posts",
      field: "id",
      reference: "authorId",
      onDelete: "NoAction",  // 指定しない場合と同じ
    },
  },
}
```

## 複数リレーションでの onDelete

1 つのシートに複数のリレーションを定義し、それぞれ異なる onDelete を設定できます。

```ts
relations: {
  Users: {
    posts: {
      type: "oneToMany",
      to: "Posts",
      field: "id",
      reference: "authorId",
      onDelete: "Cascade",    // 投稿は一緒に削除
    },
    profile: {
      type: "oneToOne",
      to: "Profiles",
      field: "id",
      reference: "userId",
      onDelete: "SetNull",    // プロフィールは FK を null に
    },
  },
}
```
