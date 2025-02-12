---
sidebar_position: 1
---

# create()

該当シートに新しい 1 行を追加したい場合に利用します。

## 使用できるキー

| キー名 | 内容                 | 省略 |
| ------ | -------------------- | ---- |
| data   | 登録するデータの指定 | 不可 |

## 説明例用のシート

![説明用シート](../../img/exampleSheet.png)

## 説明

上記例に以下の行を追加したいとします。

- name => **Shibata**
- age => **23**
- pref => **Shimane**
- postNumber => **690-8540**

この場合以下のコードとなります。

```ts
// gassma.sheets.{{TARGET_SHEET_NAME}}.create
const result = gassma.sheets.sheet1.create({
  data: {
    name: "Shibata",
    age: 23,
    pref: "Shimane",
    postNumber: "690-8540",
  },
});
```

戻り値は以下の形式です。

```ts
{
  name: 'Shibata',
  age: 23,
  pref: 'Shimane',
  postNumber: '690-8540'
}
```

作成された行のデータが返されます。

また、以下のように年齢を省くとその行の`age`列部分が空になります。

```ts
// gassma.sheets.{{TARGET_SHEET_NAME}}.create
gassma.sheets.sheet1.create({
  data: {
    name: "Shibata",
    pref: "Shimane",
    postNumber: "690-8540",
  },
});
```

戻り値は以下の形式です。

```ts
{
  name: 'Shibata',
  age: null,
  pref: 'Shimane',
  postNumber: '690-8540'
}
```
