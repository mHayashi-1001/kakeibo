---
name: new-api-route
description: kakeiboの既存のCRUD API規約(Edge Runtime、@neondatabase/serverlessのneon()、{ success, ... }形式のJSONレスポンス、src/lib/validate.tsでのバリデーション)に沿って、src/app/api/配下に新しいAPIルートの雛形を作る。「新しいAPIルートを作りたい」「itemテーブルに新しいエンドポイントを追加したい」といった依頼で使う。
---

# new-api-route

`src/app/api/{search,insert,update,delete}/route.ts` の実装パターンに沿って、新しいAPIルートを一貫した形で作成するスキル。

## 前提(既存4ルートに共通する規約)

1. ファイル冒頭に `export const runtime = "edge";` を必ず宣言する(理由のコメントは`src/app/api/insert/route.ts`を参照するか簡潔に一言添える程度でよい)。
2. DB接続は`@neondatabase/serverless`の`neon()`のみを使う。`pg`やPrisma Clientは使わない(Edge Runtimeで動かないため)。
3. `process.env.DATABASE_URL` が未設定の場合は `{ success: false, error: "DATABASE_URLが設定されていません" }` を返す。
4. リクエストボディはJSON.parseし、失敗時は `{ success: false, error: "JSONのパースに失敗しました" }` を返す(GETのみのルートなど、ボディがない場合は不要)。
5. 入力チェックは`src/lib/validate.ts`の`validateItemFields`/`validateId`を再利用する。新しいバリデーションが必要な場合は同ファイルに追加し、既存の関数と同じ「問題があればエラー文字列、なければnull」という形に合わせる。
6. SQLは`sql\`...\``のタグ付きテンプレートで直接書く(ORM的な抽象化を挟まない)。パラメータは`${}`で埋め込み、文字列結合はしない(SQLインジェクション対策)。
7. 成功時は`{ success: true, ... }`、失敗時は`{ success: false, error: string }`をいずれも**HTTP 200**で返す(`NextResponse.json`にステータスコードを指定しない)。DB例外は`catch (e: unknown)`で受けて`{ success: false, error: String(e) }`にする。
8. `type`/`category`を扱う場合は`src/lib/categories.ts`の`ItemType`/`ITEM_TYPES`/`CATEGORIES_BY_TYPE`を参照し、独自の許容値を定義しない。

## 作成手順

1. どのCRUD操作に近いか(単純取得は`search`、新規作成は`insert`、更新は`update`、削除は`delete`)を確認し、最も近い既存ルートをReadで読んでテンプレートにする。
2. `src/app/api/<新ルート名>/route.ts` を作成し、上記の規約に沿って実装する。HTTPメソッドは操作に応じて選ぶ(参照系はGET、作成はPOST、更新はPUT、削除はDELETE)。
3. `item`テーブルにない列やテーブルを新たに使う場合は、`prisma/schema.prisma`にモデルを追加し、`npx prisma migrate dev --name <name>`でローカルにマイグレーションを作成する(本番への適用は別途ユーザー確認の上で行う。db-safety-guardianエージェントも参照)。
4. フロントエンドから呼ぶ場合は、呼び出し側でも`{ success, error }`形式のレスポンスを想定したエラーハンドリングを行う。
5. このリポジトリにテストスイートはないため、`project/`で`npx tsc --noEmit`と`yarn build`を実行して型・ビルドエラーがないことを確認する。実際に`yarn dev`で叩いて動作確認するとなお良い。

## 注意

- 新しいルートが`item`以外のテーブルを扱う場合や、認証・権限チェックが必要な場合は、既存4ルートにはない要件なので実装方針を先にユーザーと確認する。
