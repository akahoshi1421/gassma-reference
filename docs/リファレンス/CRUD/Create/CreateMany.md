---
sidebar_position: 2
---

# createMany()

該当シートに複数行を同時に追加したい場合に利用します。

## 説明例用のシート

![説明用シート](../../img/exampleSheet.png)

## 説明

上記例に以下の行を追加したいとします。

- 1 行目

  - name => **Shibata**
  - age => **23**
  - pref => **Shimane**
  - postNumber => **690-8540**

- 2 行目
  - name => **Suzuhara**
  - age => **25**
  - pref => **Tottori**
  - postNumber => **680-8571**

この場合以下のコードとなります。

```ts
// gassma.sheets.{{TARGET_SHEET_NAME}}.createMany
const result = gassma.sheets.sheet1.createMany({
  data: [
    {
      name: "Shibata",
      age: 23,
      pref: "Shimane",
      postNumber: "690-8540",
    },
    {
      name: "Suzuhara",
      age: 25,
      pref: "Tottori",
      postNumber: "680-8571",
    },
  ],
});

// OUTPUT => { count: 2 }
console.log(result);
```

戻り値は作成された行の数です。
