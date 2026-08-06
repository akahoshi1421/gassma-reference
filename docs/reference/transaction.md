
# $transaction（トランザクション）

`$transaction` は、複数の操作をまとめて 1 つのトランザクションとして実行するための機能です。Prisma のインタラクティブトランザクション（コールバック形の `$transaction`）に相当します。

コールバック内の書き込み操作は即座にはシートへ反映されず、コールバックが**正常終了した時点でまとめてシートに書き込まれます**（コミット）。コールバックが throw した場合、シートには **1 セルも書き込まれません**。

## 基本的な使い方

`gassma.$transaction((tx) => {...})` の形で呼び出します。コールバックにはトランザクション用クライアント `tx` が渡され、コールバックの戻り値がそのまま `$transaction` の戻り値として返ります。

```ts
const user = gassma.$transaction((tx) => {
  const created = tx.Users.create({
    data: { id: 1, name: "Tanaka" },
  });
  tx.Posts.create({
    data: { id: 10, title: "Hello", authorId: created.id },
  });
  return created;
});
// コールバックが正常終了した時点で Users と Posts にまとめて書き込まれる
```

GAS 上で動作するため、Prisma と異なり `$transaction` は**同期的**に実行されます。コールバックも `$transaction` の戻り値も Promise ではありません。`async` / `await` は不要です。

## throw で全キャンセル

コールバックの途中でエラーが throw されると、それまでの書き込みはすべて破棄され、シートには何も反映されません。

```ts
try {
  gassma.$transaction((tx) => {
    tx.Users.create({ data: { id: 1, name: "Tanaka" } });
    tx.Posts.create({ data: { id: 10, title: "Hello", authorId: 1 } });
    throw new Error("cancel");
  });
} catch (e) {
  // Users にも Posts にも 1 行も書き込まれていない
}
```

## tx クライアント

`tx` では通常のクライアントと同じモデル群（シート）が使えます。`$extends` も使え、トランザクション内だけに適用される拡張クライアントを作れます。

```ts
gassma.$transaction((tx) => {
  const extended = tx.$extends({
    query: {
      Users: {
        findMany({ args, query }) {
          return query(args);
        },
      },
    },
  });
  return extended.Users.findMany();
});
```

一方、`tx` に `$transaction` はありません（型上も存在しません）。トランザクションのネストは非対応で、トランザクション内で `$transaction` を呼ぶと `GassmaNestedTransactionError` が throw されます。

### トランザクション内の読み取り（read-your-writes）

トランザクション内の読み取り（`findMany` / `include` / リレーションフィルタなど）には、**まだコミットされていない変更が見えます**。一方、トランザクションの外のクライアントからは、コミットされるまで変更は見えません。

```ts
gassma.$transaction((tx) => {
  tx.Users.create({ data: { id: 1, name: "Tanaka" } });

  // tx 内の読み取りには未コミットの変更が見える
  const found = tx.Users.findFirst({ where: { id: 1 } }); // 見つかる

  // tx の外のクライアントからはコミットまで見えない
  const outside = gassma.Users.findFirst({ where: { id: 1 } }); // null
});
```

## ロック

`$transaction` は、`GassmaClient` に渡された `lock` を取得してから開始します。

`npx gassma generate` が生成するクライアントは、この `lock` に `LockService.getScriptLock()` を既定値として埋めます。この `LockService.getScriptLock()` は**あなたのプロジェクトで評価される**ため、取得されるのは**あなたのスクリプトプロジェクトのロック**です。CLI を使う場合、書き方は今までと変わりません。

```ts
const gassma = new GassmaClient(); // lock は自動で埋まる
```

この `lock` は [autoincrement](/docs/reference/config/autoincrement) の採番にも使われます。

### ロックの粒度

コンストラクタで `lock` を明示すると、既定値を上書きできます。

```ts
const gassma = new GassmaClient({
  lock: LockService.getDocumentLock(),
});
```

| 渡す値 | 直列化される範囲 |
| --- | --- |
| `LockService.getScriptLock()`（既定） | 同じスクリプトプロジェクトの実行どうし |
| `LockService.getDocumentLock()` | 同じドキュメント（バインド先のスプレッドシート）の実行どうし |
| `LockService.getUserLock()` | 同じユーザーの実行どうし |

`$transaction` の第 2 引数に `lock` はありません。粒度はクライアントを生成する時点で決まります。

`LockService.getDocumentLock()` は、**スタンドアロンスクリプトまたはウェブアプリから呼ぶと `null` を返します**（例外にはなりません）。スプレッドシートにバインドされたスクリプトでも、ウェブアプリ経由の実行では `null` になります。`null` を `lock` に渡すと `GassmaInvalidLockError` が throw されます。

### lock を渡していない場合

`lock` を持たないクライアントで `$transaction` を呼ぶと、`GassmaTransactionLockRequiredError` が throw されます。GAS エディタだけで使う場合は自分で渡してください（[GAS エディタでの利用](/docs/reference/gas-editor)）。

```ts
const gassma = new Gassma.GassmaClient({
  lock: LockService.getScriptLock(),
});
```

## オプション

第 2 引数でオプションを指定できます。

```ts
gassma.$transaction(
  (tx) => {
    // ...
  },
  { maxWait: 10000, timeout: 120000, rollback: false },
);
```

| オプション | 既定値 | 説明 |
| --- | --- | --- |
| `maxWait` | `20000`（ms） | トランザクション開始（ロック取得）を待つ時間の上限。超過すると `GassmaTransactionLockTimeoutError` |
| `timeout` | `60000`（ms） | トランザクション全体の実行時間の上限。超過すると `GassmaTransactionTimeoutError` |
| `rollback` | `true` | コミット時のバックアップと失敗時の自動復元を有効にするか（詳細は[後述](#rollback)） |

### maxWait

トランザクションは、クライアントの [`lock`](#ロック) を取得してから開始されます。別の実行が同じロックを保持している場合（別の `$transaction` の実行中など）、最大 `maxWait` ミリ秒までロックの解放を待ち、それでも取得できなければ `GassmaTransactionLockTimeoutError` を throw します。

### timeout

トランザクション開始からの経過時間が `timeout` ミリ秒を超えると `GassmaTransactionTimeoutError` を throw します。チェックは協調式で、**各 tx 操作の呼び出し時**と**コミット直前**に経過時間を確認します。

協調式のため、tx のメソッドを呼ばない処理（長い計算ループなど）の途中では超過を検知できません。その場合も、次の tx 操作またはコミット直前のチェックで検知されます。

### rollback

`rollback: true`（既定）のとき、コミットは次の流れで行われます。

1. 書き込み対象のシートを一時バックアップ（`_gassma_tx_...` という名前の隠しシート）として複製する
2. シートへ書き込む
3. 成功したらバックアップを自動削除する

書き込みの途中で失敗した場合は、**バックアップから自動復元**したうえで元のエラーを再 throw します。シートはその場で復元され、数式セルも保たれます。復元まで失敗した場合は**バックアップシートを残して** `GassmaTransactionRollbackError` を throw します。このエラーの `backupSheetNames` プロパティに残されたバックアップシート名の一覧が入っており、そこから手動で復旧できます。

`{ rollback: false }` を指定すると、この仕組みを丸ごと省略します（高速）。ただし、書き込みの途中で失敗した場合はシートが部分的に書き込まれた状態になり得ます。

`rollback` 有効時は、バックアップ複製（`copyTo`）のコストが**書き込み対象シートのサイズに比例**して掛かり、GAS の 6 分実行制限も消費します。大きいシートへのトランザクションや高頻度のトランザクションでは `rollback: false` を検討してください。

## 制限事項

- ロックが直列化するのは、GASsma を経由する処理同士だけです。スプレッドシートの手動編集や、GASsma を使わない別スクリプトからの変更は止められません。同時実行で何が起こりうるかは[書き込みの原子性と同時実行](/docs/reference/write-atomicity)を参照してください。
- **直列化される範囲は `lock` に渡したロックで決まります。** 既定の `LockService.getScriptLock()` で直列化されるのは、**同じスクリプトプロジェクトの実行どうしだけ**です。同じスプレッドシートを**別の GAS プロジェクトから触る場合、互いのトランザクションは直列化されません**。粒度の選び方は[ロック](#ロック)を参照してください。
- 実行が強制終了された場合（GAS の 6 分実行制限など）は、バックアップシートが残ることがあります。次回の `$transaction` 実行時に警告ログが出力されます。残った `_gassma_tx_...` シートは、中身を確認のうえ手動で削除して構いません。
- 復元されるのはセルの値と数式のみです（書式などは対象外）。
- [changeSettings](/docs/reference/settings/changeSettings) で実行時に変更した設定は、トランザクション内に引き継がれません。
- [autoincrement](/docs/reference/config/autoincrement) のカウンターを書き換える `$setAutoincrement` / `$syncAutoincrement` はトランザクション内から呼べません（`GassmaAutoincrementInTransactionError`）。カウンターは `PropertiesService` にあってロールバックの対象外のためです。読み取りの `$getAutoincrement` は呼べます。
- 操作の配列を渡す形（Prisma の sequential operations）は非対応です。コールバック形のみ使えます。
- `isolationLevel` は非対応です（常にロックによる直列実行）。

## 関連エラー

`GassmaTransactionLockTimeoutError` / `GassmaTransactionTimeoutError` / `GassmaNestedTransactionError` / `GassmaTransactionRollbackError` / `GassmaTransactionLockRequiredError` / `GassmaInvalidLockError` の詳細は[エラー一覧](/docs/reference/errors)を参照してください。
