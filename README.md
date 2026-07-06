# 家計簿

日々の収支をシンプルに記録・確認できる家計簿アプリです。

## 機能

- 収支の入力(日付・内容・金額・収支種別・カテゴリ)
- 一覧表示(行クリックでその場編集、削除)
- 収入・支出・差引の合計サマリー表示

## フォルダ構成

```
.
├── CLAUDE.md          # Claude Code向けの開発ガイド
├── README.md          # このファイル
├── .devcontainer/     # 開発用コンテナ設定(Node.js + ローカルPostgres)
├── .github/workflows/ # PRビルドチェック(GitHub Actions)
└── project/           # アプリ本体(Next.js)
    ├── src/app/       # ページ・APIルート(App Router)
    ├── src/lib/       # 共有ロジック(カテゴリ定義など)
    └── prisma/        # DBスキーマ・マイグレーション
```

アプリのコードはすべて `project/` 配下にあります。

## このプロジェクトで使っている技術

### フロントエンド

- React（UI ライブラリ）
- Next.js（React フレームワーク）  
  動的なユーザーインターフェース

### ホスティング

- Cloudflare Pages（ホスティング）  
  静的サイト配信

### API

- Cloudflare Functions（API エンドポイント/サーバーレス関数）  
  サーバサイド処理

### バックエンド

- Prisma（ORM/データベース操作、スキーマ・マイグレーション管理用）  
  TypeScript でデータベースを操作できる

### データベース

- PostgreSQL（データベース）
- Neon（サーバーレス PostgreSQL）  
  サーバーレスで PostgreSQL サービスを使用できる

## 開発環境

VS Code の Dev Containers 拡張機能で `.devcontainer` を開くと、Node.js とローカル用PostgreSQLコンテナが立ち上がります。

```bash
cd project
yarn install
yarn dev
```

`http://localhost:3000` で確認できます。

DB接続まわりの制約(Edge Runtime・本番/ローカルDBの分離)や開発時の注意点は [CLAUDE.md](./CLAUDE.md) にまとめています。
