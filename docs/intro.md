---
sidebar_position: 1
---

# GASsma とは

Google スプレッドシートの表を Node.js の ORM ライブラリの 1 つである「Prisma」のように操作できるライブラリです。

まるで ORM のようにスプレッドシートを操作し、

- より管理しやすく
- よりミスを減らす
- より安全に

GoogleAppsScript(GAS)を書けるようにすることを目的としています。

## 使ってみる

適当なスプレッドシートを新規作成し、以下のデータを記入してください。(シート名は sheet1 としてください)
![説明用シート](./リファレンス/img/exampleSheet.png)

その後、`拡張機能` > `Apps Script`を開き、GAS を開いてください。

開いたら[こちらのページ](./installation)を見ながら GASsma をインストールしてください。

それでは先程作成したデータから以下のようにデータを抽出し、整形する方法を考えます。

1. 年齢が 25 歳以上の行を取り出す
2. 取り出した行は名前を基準に昇順で並び替える
3. 列名をキーとした連想配列に変換する

これを GASsma で書いていきます。以下のように書き、`myFunction`を実行してみてください。

```ts
const gassma = new Gassma.GassmaClient();

function myFunction() {
  const result = gassma.sheet1.findMany({
    where: {
      age: {
        gte: 25,
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  console.log(result);
}
```

以上です。

**インスタンスを生成し、findMany メソッドを呼び出すだけで、データの抽出が可能です。** 列名もライブラリが自動で読んでくれます。

## なぜ GASsma は必要なのか

既存の GAS でスプレッドシートを操作する際の大変なところは主に 3 つあります。

### 1. コード管理の煩雑さ

上にあげた例を一般的な GAS で記述すると以下のようになります。

```ts
function myFunction() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const hogeSheet = sheet.getSheetByName("sheet1");

  const rowLength = hogeSheet.getLastRow() - 1;
  if (rowLength === 0) {
    console.log([]);
    return;
  }

  // 指定した範囲からデータを抽出
  const data = hogeSheet.getRange(2, 1, rowLength, 4).getValues();

  // 25歳以上の行を取り出すフィルタリング
  const gte25Data = data.filter((row) => row[1] >= 25);

  // ソート
  const gte25DataSorted = gte25Data.sort((a, b) => (a[0] >= b[0] ? 1 : -1));

  // 連想配列に変換
  const gte25DataSortedDict = gte25DataSorted.map((row) => {
    return {
      name: row[0],
      age: row[1],
      pref: row[2],
      postNumber: row[3],
    };
  });

  console.log(gte25DataSortedDict);
}
```

しかしこれはまだコードが短く、ロジックも簡単な方です。

ここから

**「同じ名前があった場合は年齢の昇順で並び替える」**

等条件が増えていったり

**「25 歳以上 60 歳以下かつ都道府県が東京の人の平均年齢を求める」**

等複雑な要件があるとコードが複雑になり、管理が難しくなります。

### 2. コードのミスを起こしやすい性質

GAS のスプレッドシート操作はコードのミスを起こしやすい性質を持っています。 スプレッドシートから指定した範囲のデータを取り出す際、`getRange()`を利用します。 `getRange()` は引数に行番号や列番号を指定することで指定した範囲のセルを取り出すことができるメソッドです。

つまり、`getRange()` を利用する際は、その度にスプレッドシート上のセルの行番号や列番号を確認する必要があります。要するに数え間違いのリスクが発生します。これは `getRange()`をコード内で使えば使うほどそのリスクは上がります。

### 3. ある程度セキュリティを意識しないといけない

GoogleFormから提出されたデータをスプレッドシートに挿入する場合を考えます。
例えば以下のコードには問題があります。なんでしょうか？

```ts
function myFunction(e) {
  // Google Formから提出された値を取得
  const values = e.namedValues;
  const newValues = [values["名前"], values["年齢"], values["都道府県"], values["郵便番号"]];

  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const hogeSheet = sheet.getSheetByName("シート名");
  const newRow = hogeSheet.getLastRow() + 1;

  // シート挿入
  hogeSheet.getRange(newRow, 1, 1, 4).setValues([newValues]);
}
```

正解は悪意のあるユーザがフォームの解答欄に`=C1`のようなスプレッドシート関数を入れた時、任意の不正な処理ができてしまいます。(フォーミュラ・インジェクション)

<hr/>
これらの問題を解決してくれるのが本ライブラリ、**「GASsma」** です。
