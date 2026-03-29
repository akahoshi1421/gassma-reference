---
sidebar_position: 7
slug: /reference/config/autoincrement
---

# autoincrement

Prisma の `autoincrement()` に相当する機能です。`create` 時に一意で単調増加する値を自動的に割り当てます。

## 基本的な使い方

```ts
const gassma = new Gassma.GassmaClient({
  autoincrement: {
    Users: "id",
  },
});

// create 時に自動で id が振られる
gassma.Users.create({
  data: { name: "Alice" },
});
// => \{ id: 1, name: "Alice" \}

gassma.Users.create({
  data: { name: "Bob" },
});
// => \{ id: 2, name: "Bob" \}
```

## 複数カラム対応

配列で複数カラムを指定できます。

```ts
autoincrement: {
  Users: ["id", "seq"],
}
```

## createMany での動作

`createMany` では全行分のカウンターを一括確保してから各行に割り当てます。

```ts
gassma.Users.createMany({
  data: [{ name: "Alice" }, { name: "Bob" }],
});
// => id: 1, 2 がそれぞれ割り当てられる
```

## 仕組み

1. `LockService.getScriptLock().waitLock(10000)` で排他制御
2. `PropertiesService.getScriptProperties()` からカウンターを読み取り
3. +1（createMany の場合は +N）して書き込み
4. ロック解放

:::note
GAS の `LockService` と `PropertiesService` を使用するため、GAS 環境でのみ動作します。
:::

## 明示指定時の動作

フィールドに明示的に値を指定した場合、自動採番はスキップされます。

```ts
gassma.Users.create({
  data: { id: 100, name: "Alice" },
});
// => id は 100（自動採番されない）
```
