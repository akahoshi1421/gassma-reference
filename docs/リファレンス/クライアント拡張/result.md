---
sidebar_position: 2
slug: /reference/client-extensions/result
---

# $extends（result）

`$extends` の `result` コンポーネントは、クエリ結果のレコードに**算出フィールド**（computed fields）を追加するための機能です。Prisma のクライアント拡張（`$extends` の `result`）に相当します。既存のスカラーフィールドから新しいフィールドを計算し、結果に含めることができます。

クエリの実行そのものに割り込みたい場合は[$extends（query）](/docs/reference/client-extensions/query)を参照してください。

## 基本的な使い方

`gassma.$extends({ result: {...} })` を呼ぶと、算出フィールドを含む**新しい結果型のクライアント**が返ります。元の `gassma` は変更されません。

算出フィールドは `needs`（計算に必要なスカラーフィールド）と `compute`（計算関数）のペアで定義します。

```ts
const extended = gassma.$extends({
  result: {
    Users: {
      greeting: {
        needs: { name: true },
        compute(user) {
          return `Hi ${user.name}`;
        },
      },
    },
  },
});

const user = extended.Users.findFirst({ where: { id: 1 } });
user.greeting; // "Hi Alice"
```

## needs と compute

| キー | 内容 |
| --- | --- |
| `needs` | 計算に必要な**スカラーフィールド**を `{ フィールド名: true }` で宣言する |
| `compute` | `needs` で宣言したフィールドだけを持つレコードを受け取り、算出値を返す |

`compute` が受け取るレコードは `needs` で宣言したフィールドだけを含み、その**型も `needs` から付きます**。型注釈は不要です。

```ts
const extended = gassma.$extends({
  result: {
    Users: {
      greeting: {
        needs: { name: true },
        // user は { name: string } として型が付く
        compute(user) {
          return `Hi ${user.name}`;
        },
      },
    },
  },
});
```

:::note
`needs` に指定できるのは**スカラーフィールドのみ**です。リレーションは指定できません。
:::

## 通常のプロパティとして付与される

算出フィールドは getter ではなく、**その場で計算された通常のプロパティ**として結果に付与されます。そのため `Logger.log` / `JSON.stringify` / スプレッド構文でも安定して扱えます。

```ts
const user = extended.Users.findFirst({ where: { id: 1 } });

Logger.log(user.greeting); // "Hi Alice"
JSON.stringify(user); // greeting を含む
const copy = { ...user }; // copy.greeting も残る
```

## 算出フィールドが付く操作

算出フィールドは、**レコードを返す操作**の結果に付与されます。

| 付与される | 付与されない |
| --- | --- |
| `findFirst` / `findFirstOrThrow` / `findMany` | `count` / `aggregate` / `groupBy` |
| `create` / `createManyAndReturn` | `createMany` |
| `update` / `updateManyAndReturn` | `updateMany` |
| `upsert` / `delete` | `deleteMany` |

件数だけを返す `createMany` / `updateMany` / `deleteMany` や、集計を行う `count` / `aggregate` / `groupBy` には付与されません。

## 既存フィールドの上書き

既存フィールドと同じ名前の算出フィールドを定義すると、その値を**上書き**できます。

```ts
const extended = gassma.$extends({
  result: {
    Users: {
      // 既存の name を大文字に置き換える
      name: {
        needs: { name: true },
        compute(user) {
          return user.name.toUpperCase();
        },
      },
    },
  },
});
```

## 算出フィールドどうしの依存

算出フィールドは、別の算出フィールドに依存できます。依存先を `needs` に入れてください。

```ts
const extended = gassma
  .$extends({
    result: {
      Users: {
        fullName: {
          needs: { firstName: true, lastName: true },
          compute(user) {
            return `${user.firstName} ${user.lastName}`;
          },
        },
      },
    },
  })
  .$extends({
    result: {
      Users: {
        greeting: {
          needs: { fullName: true }, // 別の算出フィールドに依存
          compute(user) {
            return `Hi ${user.fullName}`;
          },
        },
      },
    },
  });
```

:::note
**チェーンした `$extends`（別の `$extends` 呼び出し）越しの依存**では、依存先の値の型も完全に付きます。

一方、**同一の `$extends` 呼び出しの中**で算出フィールドどうしを依存させると、実行時は動作しますが、依存先の `compute` に引数注釈が無い場合は依存値の**型が付きません**（`never` になります）。型も必要な場合は、依存先の `compute` に引数注釈を付けるか、チェーンした `$extends` に分けてください。これは TypeScript の制約によるもので、Prisma でも同様です。
:::

## $allModels で全モデルに追加

`$allModels` を使うと、すべてのモデルに共通の算出フィールドを追加できます。同名の算出フィールドがモデル固有にも定義されている場合は、モデル固有のものが優先されます。

```ts
const extended = gassma.$extends({
  result: {
    $allModels: {
      fetchedAt: {
        compute() {
          return new Date();
        },
      },
    },
  },
});
```

## select / omit との連携

`select` を指定した場合は、**選択した算出フィールドだけ**が結果に含まれます。`select` を指定しなければ、すべての算出フィールドが含まれます。

```ts
const user = extended.Users.findFirst({
  where: { id: 1 },
  select: { greeting: true }, // greeting だけが返る
});
```

`omit` で算出フィールドを除外することもできます。

```ts
const user = extended.Users.findFirst({
  where: { id: 1 },
  omit: { greeting: true }, // greeting を除外
});
```

`needs` に指定したスカラーフィールドは、`select` で選ばなくても `omit` で除外しても、`compute` のために内部で読み込まれます（compute は問題なく動作します）。

## ネストした include にも付与される

`include` で取得した関連レコードにも、そのモデルの算出フィールドが付与されます。深くネストした場合も、各階層のレコードに付与されます。

```ts
const result = extended.Users.findMany({
  include: {
    posts: true, // 各 post にも Posts の算出フィールドが付く
  },
});
```

`include` の詳細は[include](/docs/reference/relation/include)を参照してください。

## query との併用

`query` と `result` は同時に指定できます。

```ts
const extended = gassma.$extends({
  query: {
    Users: {
      findMany({ args, query }) {
        return query(args);
      },
    },
  },
  result: {
    Users: {
      greeting: {
        needs: { name: true },
        compute(user) {
          return `Hi ${user.name}`;
        },
      },
    },
  },
});
```

## 制約

:::caution
算出フィールドは `where` / `orderBy` / 集計（`count` / `aggregate` / `groupBy`）では使用できません。また、`needs` に指定できるのはスカラーフィールドのみです（リレーションは不可）。
:::

## 実用例

### fullName

`firstName` と `lastName` を結合した `fullName` を追加します（Users シートに `firstName` / `lastName` 列がある場合）。

```ts
const extended = gassma.$extends({
  result: {
    Users: {
      fullName: {
        needs: { firstName: true, lastName: true },
        compute(user) {
          return `${user.firstName} ${user.lastName}`;
        },
      },
    },
  },
});

const user = extended.Users.findFirst({ where: { id: 1 } });
user.fullName; // "Alice Smith"
```

### 派生フィールド

既存のフィールドから派生した値を追加します。

```ts
const extended = gassma.$extends({
  result: {
    Posts: {
      excerpt: {
        needs: { content: true },
        compute(post) {
          return post.content.slice(0, 20);
        },
      },
    },
  },
});
```
