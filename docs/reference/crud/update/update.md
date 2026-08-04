
# update()

特定の条件に合致した**最初の 1 行**を指定した値に更新し、更新後のレコードを取得します。条件に合致するレコードがない場合は `null` を返します。

## 使用できるキー

| キー名  | 内容                       | 省略 | 備考                                             |
| ------- | -------------------------- | ---- | ------------------------------------------------ |
| where   | 取得条件の指定             | 不可 | 複数行が一致する場合は最初の 1 行のみ更新されます |
| data    | 更新するデータ             | 不可 |                                                  |
| select  | 戻り値の取得列の表示設定   | 可   | `omit` / `include` と同時に使用できません        |
| omit    | 戻り値の取得列の除外設定   | 可   | `select` と同時に使用できません                  |
| include | リレーション先の取得       | 可   | [詳細はこちら](/docs/reference/relation/include) |

`where` と `data` は必須です。いずれかを省略すると `GassmaMissingArgumentError`（例: Argument `where` is missing.）がスローされます。また、条件が 1 つもない `where: {}` は `GassmaInvalidValueError`（Invalid value for argument `where`. Expected at least one condition.）がスローされます。`undefined` や `Gassma.skip` の除去によって `where` が空になった場合も同様です。

## 説明例用のシート

![説明用シート](../../img/exampleSheet.png)

## 説明

上記例から以下の処理を行いたいとします。

- name が **akahoshi** の行の age を **23** にする

この場合以下のコードとなります。

```ts
const gassma = new Gassma.GassmaClient();

// gassma.{{TARGET_SHEET_NAME}}.update
const result = gassma.sheet1.update({
  where: {
    name: "akahoshi",
  },
  data: {
    age: 23,
  },
});
```

戻り値は以下の形式です。

```ts
{
  name: 'akahoshi',
  age: 23,
  pref: 'Ibaraki',
  postNumber: '310-8555'
}
```

更新後のレコードが返されます。更新していないフィールドは元の値がそのまま保持されます。

`data` の値に `undefined` を渡したフィールドは「指定しなかった」扱いになり、更新されません。

```ts
const result = gassma.sheet1.update({
  where: { name: "akahoshi" },
  data: { name: undefined, age: 23 },
});
// => name は元の値のまま、age だけが 23 に更新される
```

条件に合致するレコードがない場合は `null` が返されます。

```ts
const result = gassma.sheet1.update({
  where: { name: "存在しない名前" },
  data: { age: 99 },
});
// => null
```

また`where`の仕様は[findMany()の記事](../read/findMany)に準拠します。ただし `findMany` と異なり、条件が 1 つもない `where: {}` はエラーになります（上記 note を参照）。

## 数値の原子的操作

`data` に `increment` / `decrement` / `multiply` / `divide` を指定すると、現在値に対して演算を行えます。

```ts
// age を 1 加算する
const result = gassma.sheet1.update({
  where: { name: "akahoshi" },
  data: {
    age: { increment: 1 },
  },
});
// age: 22 → 23
```

| 操作 | 動作 | 例 |
| --- | --- | --- |
| increment | 加算 | `{ increment: 5 }` → 現在値 + 5 |
| decrement | 減算 | `{ decrement: 3 }` → 現在値 - 3 |
| multiply | 乗算 | `{ multiply: 2 }` → 現在値 × 2 |
| divide | 除算 | `{ divide: 4 }` → 現在値 ÷ 4 |

現在値が数値でない場合は `0` をベースとして演算されます。

### 演算子に渡す値

`increment` などの演算子の引数に `NaN` / `Infinity` / `-Infinity` を渡すと `GassmaInvalidValueError` がスローされます。このとき `{argumentName}` は**演算子のキー**になります。

```ts
gassma.sheet1.update({ where: { name: "akahoshi" }, data: { age: { increment: NaN } } });
// => Invalid value for argument `increment`. Expected a finite number, but received NaN.
```

### 演算結果

演算の**結果**が `NaN` / `Infinity` / `-Infinity` になる場合も `GassmaInvalidValueError` がスローされます。このとき `{argumentName}` は**カラム名**になります（演算子のキーではありません）。

```ts
gassma.sheet1.update({ where: { name: "akahoshi" }, data: { age: { divide: 0 } } });
// => Invalid value for argument `age`. Expected a finite number, but received Infinity.
```

現在値が `0` の状態で `divide: 0` を指定した場合は `0 / 0` で `NaN` になります。

```ts
// age が 0 の行に対して
data: { age: { divide: 0 } };
// => Invalid value for argument `age`. Expected a finite number, but received NaN.
```

桁あふれも対象です。演算結果が数値として表現できる範囲を超えた場合は `Infinity` / `-Infinity` になるためエラーになります。

```ts
// age が 20 の行に対して
data: { age: { multiply: 1e308 } };
// => Invalid value for argument `age`. Expected a finite number, but received Infinity.
```

結果が有限の数値に収まる場合は従来どおり更新されます。エラーになった場合、行は書き換えられません。

この検証は `update` / `updateMany` / `updateManyAndReturn`、`upsert` の更新分岐、および [Nested Write（update）](/docs/reference/relation/nested-write-update) の `update` すべてで行われます。

通常の値指定と組み合わせることもできます。

```ts
const result = gassma.sheet1.update({
  where: { name: "akahoshi" },
  data: {
    age: { increment: 1 },
    pref: "Tokyo",
  },
});
```

数値操作は**数値カラムに対してのみ**利用できます。文字列カラムに `increment` などを指定すると型エラーになります。`@gassma.addType` で数値を含む複合型（例: `number | string`）にしたカラムも数値操作の対象になります。

数値操作は `update` だけでなく、`updateMany` / `updateManyAndReturn`、`upsert` の `update`、および [Nested Write（update）](/docs/reference/relation/nested-write-update) の `update` の `data` でも同様に利用できます。

## Nested Write

リレーション定義がある場合、`data` の中にリレーション先のレコードを同時に操作する記述ができます。

`create` の Nested Write に加えて、`update` / `delete` / `deleteMany` / `disconnect` / `set` 操作が利用できます。

詳しくは [Nested Write（update）のリファレンス](/docs/reference/relation/nested-write-update)を参照してください。
