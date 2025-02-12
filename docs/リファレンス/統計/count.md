---
sidebar_position: 2
---

# count()

ヒット数を求めたい場合に利用します。

## 説明例用のシート

![説明用シート](../img/exampleSheet.png)

## 説明

上記例から以下の処理を行いたいとします。

- age => **20 以上**

この場合以下のコードとなります。

```ts
// gassma.sheets.{{TARGET_SHEET_NAME}}.count
const result = gassma.sheets.sheet1.count({
  where: {
    age: {
      gte: 20,
    },
  },
});
```

戻り値は以下の形式です。

```
9
```
