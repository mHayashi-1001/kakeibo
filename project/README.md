Next.js (App Router) 製の家計簿アプリ本体です。プロジェクト全体の概要は [ルートのREADME](../README.md) を、開発時の注意点は [CLAUDE.md](../CLAUDE.md) を参照してください。

「App Router」とは、Next.jsでページやAPIの場所をフォルダ構成でそのまま表す仕組みです。たとえば`src/app/entry/page.tsx`が`/entry`という画面に、`src/app/api/insert/route.ts`が`/api/insert`というAPIになります。

## セットアップ

```bash
yarn install   # 依存パッケージ(このアプリが動くのに必要な外部ライブラリ)をインストールする
yarn dev       # 開発サーバーを起動する
```

[http://localhost:3000](http://localhost:3000) で確認できます。

## 主なコマンド

```bash
yarn dev          # 開発サーバー起動(Turbopack)。ファイルを保存すると自動で画面に反映される
yarn build        # 本番用にビルドする(PRのCIチェックと同じ)
yarn lint         # ESLint。コードの書き方の問題を自動でチェックしてくれるツール
yarn test         # vitest。src/lib配下のロジックのユニットテストを実行する
npx tsc --noEmit  # 型チェック。TypeScriptの型(値の種類)が正しいかだけを確認する(ビルドはしない)
```

DBスキーマ(テーブルの構造)を変更するときは `npx prisma migrate dev --name <name>` でマイグレーション(スキーマ変更の記録)を作成します。本番DBへの適用(`prisma migrate deploy`)は別途確認のうえ行ってください。
