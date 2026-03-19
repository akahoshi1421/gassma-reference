---
sidebar_position: 5
slug: /reference/config/ignore
---

# ignore / ignoreSheets（@ignore / @@ignore）

Prisma の `@ignore`（フィールドレベル）と `@@ignore`（モデルレベル）に相当する機能です。

## ignore（フィールドレベル）

指定したフィールドを全操作から完全に除外します。

```ts
const gassma = new Gassma.GassmaClient({
  ignore: {
    Users: ["secretColumn", "internalData"],
  },
});

// 読み取り結果から除外される
gassma.sheets.Users.findMany({});
// => [{ id: 1, name: "Alice" }]（secretColumn, internalData は含まれない）

// 書き込みデータからも除外される
gassma.sheets.Users.create({
  data: { name: "Alice", secretColumn: "xxx" },
});
// => secretColumn は無視される
```

単一カラムの場合は文字列で指定できます。

```ts
ignore: {
  Users: "secretColumn",
}
```

### 除外される箇所

- **読み取り結果**: find / create / update / delete / upsert の返り値
- **書き込みデータ**: create / createMany / upsert の data
- **where 条件**: where 句からも除外

### グローバル omit との違い

| | `ignore` | グローバル `omit` |
| --- | --- | --- |
| オーバーライド | 不可 | `omit: \{field: false\}` で無効化可能 |
| 書き込み除外 | ✅ | ❌（読み取りのみ） |
| where 除外 | ✅ | ❌ |

## ignoreSheets（モデルレベル）

指定したシートを `gassma.sheets` から完全に除外します。

```ts
const gassma = new Gassma.GassmaClient({
  ignoreSheets: ["Logs", "Temp"],
});

// gassma.sheets.Logs → undefined（除外済み）
// gassma.sheets.Users → 通常通り利用可能
```

単一シートの場合は文字列で指定できます。

```ts
ignoreSheets: "Logs",
```
