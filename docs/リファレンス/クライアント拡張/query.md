---
sidebar_position: 1
slug: /reference/client-extensions/query
---

# $extends（query）

`$extends` の `query` コンポーネントは、各操作の実行に割り込むクエリフックを登録するための機能です。Prisma のクライアント拡張（`$extends` の `query`）に相当します。フックの中で `args` を書き換える、結果を加工する、実際の操作を実行せずに短絡する、といった制御ができます。

算出フィールドを追加したい場合は[$extends（result）](/docs/reference/client-extensions/result)を参照してください。

## 基本的な使い方

`gassma.$extends({ query: {...} })` を呼ぶと、フックを適用した**新しいクライアント**が返ります。元の `gassma` は変更されません。

```ts
const extended = gassma.$extends({
  query: {
    Users: {
      findMany({ model, operation, args, query }) {
        // args を加工してから実際のクエリを実行できる
        return query(args);
      },
    },
  },
});

const users = extended.Users.findMany();
```

## フックの形

フックは `{ model, operation, args, query }` を受け取る関数です。

| プロパティ | 内容 |
| --- | --- |
| `model` | 操作対象のモデル名（シートのコード名） |
| `operation` | 操作名（`findMany` など） |
| `args` | その操作に渡された引数 |
| `query` | 実際の操作（または次のフック）を実行する関数 |

`query(args)` を呼ぶと、渡した `args` で実際の操作が実行され、その結果が返ります。`query` を呼ぶ前に `args` を書き換える、`query` の戻り値を加工する、`query` を呼ばずに独自の値を返して短絡する、といった制御が可能です。

```ts
const extended = gassma.$extends({
  query: {
    Users: {
      findMany({ args, query }) {
        const result = query(args); // 実際の findMany を実行
        return result;
      },
    },
  },
});
```

## 対象となる操作

`query` フックは次の 15 操作に対して登録できます。

| 分類 | 操作 |
| --- | --- |
| 取得 | `findFirst` / `findFirstOrThrow` / `findMany` |
| 作成 | `create` / `createMany` / `createManyAndReturn` |
| 更新 | `update` / `updateMany` / `updateManyAndReturn` |
| upsert | `upsert` |
| 削除 | `delete` / `deleteMany` |
| 集計 | `count` / `aggregate` / `groupBy` |

## 構造

`query` は「モデル名 → 操作名 → フック」の形で指定します。特定のモデル・操作に加えて、モデル内の全操作をまとめて対象にする `$allOperations` と、全モデルを対象にする `$allModels` が使えます。

```ts
const extended = gassma.$extends({
  query: {
    // 特定モデルの特定操作
    Users: {
      findMany({ args, query }) {
        return query(args);
      },
      // モデル内の全操作
      $allOperations({ operation, args, query }) {
        return query(args);
      },
    },
    // 全モデル
    $allModels: {
      // 全モデルの特定操作
      findMany({ model, args, query }) {
        return query(args);
      },
      // 全モデルの全操作
      $allOperations({ model, operation, args, query }) {
        return query(args);
      },
    },
  },
});
```

## フックの合成順

1 つの操作に複数のフックがマッチした場合、それらは上書きされず**すべて連鎖**します。連鎖の順序は次のとおりです。

- **先に適用した拡張ほど外側**になります（後に適用した拡張ほど、実際の操作に近い内側になります）。
- 1 つの拡張の中では、**具体的なフックほど外側**になります。優先順位は `モデル.操作` > `モデル.$allOperations` > `$allModels.操作` > `$allModels.$allOperations` です。

外側のフックが `query(args)` を呼ぶと次に内側のフックが実行され、最も内側のフックが `query(args)` を呼ぶと実際の操作が実行されます。

```ts
const extended = gassma
  .$extends({
    query: {
      Users: {
        findMany({ args, query }) {
          Logger.log("A: 外側");
          return query(args);
        },
      },
    },
  })
  .$extends({
    query: {
      Users: {
        findMany({ args, query }) {
          Logger.log("B: 内側");
          return query(args);
        },
      },
    },
  });

extended.Users.findMany();
// ログ出力: "A: 外側" → "B: 内側" → 実際の findMany
```

## 同期的に実行される

GAS 上で動作するため、`query` フックは**同期的**に実行されます。`query(args)` は Promise ではなく結果そのものを同期的に返します。`async` / `await` は不要です。

```ts
const extended = gassma.$extends({
  query: {
    Users: {
      findMany({ args, query }) {
        const result = query(args); // 同期的に結果が返る
        return result;
      },
    },
  },
});
```

## args は参照で渡される

`args` はフックに**参照で渡されます**（deep clone されません）。`args` を破壊的に書き換えると、呼び出し元が持つオブジェクトにも影響します。`args` を変更したい場合は、新しいオブジェクトを作って `query` に渡すことを推奨します。

```ts
const extended = gassma.$extends({
  query: {
    Users: {
      findMany({ args, query }) {
        // NG: 渡された args を直接書き換える
        // args.where = { ...args.where, deleted: false };

        // OK: 新しいオブジェクトを作って渡す
        const nextArgs = Object.assign({}, args, {
          where: Object.assign({}, args.where, { deleted: false }),
        });
        return query(nextArgs);
      },
    },
  },
});
```

## チェーンできる

`$extends` は連続して呼び出せます。それぞれの呼び出しが新しいクライアントを返します。

```ts
const extended = gassma.$extends(extensionA).$extends(extensionB);
```

## include の内部リレーションはフックを通らない

`query` フックが対象にするのは、**最上位で呼び出した操作**だけです。`include` によって内部で解決される関連レコードの取得は、フックを通りません。

```ts
const extended = gassma.$extends({
  query: {
    Posts: {
      findMany({ args, query }) {
        // Users.findMany に対する include: { posts: true } では
        // この Posts.findMany フックは呼ばれない
        return query(args);
      },
    },
  },
});
```

## 実用例

### ソフトデリート

`findMany` の `where` に既定の条件を注入して、削除済みレコードを既定で除外できます。

```ts
const extended = gassma.$extends({
  query: {
    Users: {
      findMany({ args, query }) {
        const nextArgs = Object.assign({}, args, {
          where: Object.assign({ deleted: false }, args.where),
        });
        return query(nextArgs);
      },
    },
  },
});
```

### 監査ログ

`$allModels` の `$allOperations` で、全モデル・全操作の前後にログを記録できます。

```ts
const extended = gassma.$extends({
  query: {
    $allModels: {
      $allOperations({ model, operation, args, query }) {
        Logger.log(`${model}.${operation} 開始`);
        const result = query(args);
        Logger.log(`${model}.${operation} 完了`);
        return result;
      },
    },
  },
});
```
