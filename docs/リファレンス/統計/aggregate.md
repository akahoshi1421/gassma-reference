---
sidebar_position: 1
---

# aggregate()

平均や最大値等の統計を行いたい場合に利用します。

## 説明例用のシート

![説明用シート](../img/exampleSheet.png)

## 説明

上記例から以下の処理を行いたいとします。

- age => **平均を求める**
- age => **最大値を求める**
- age => **最低値を求める**

この場合以下のコードとなります。

```ts
// gassma.sheets.{{TARGET_SHEET_NAME}}.aggregate
const result = gassma.sheets.sheet1.aggregate({
  _avg: {
    age: true,
  },
  _max: {
    age: true,
  },
  _min: {
    age: true,
  },
});
```

戻り値は以下の形式です。

```ts
{
  _avg: { age: 33.333333333333336 },
  _max: { age: 55 },
  _min: { age: 20 }
}
```
