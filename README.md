# 家計簿

日々の収支をシンプルに記録・確認できる家計簿アプリです。**React学習を目的に作成しています。**

## はじめに読む方へ

このプロジェクトはReact学習のために作られた個人プロジェクトです。もしReactやClaude Codeが初めてなら、次の2つのドキュメントから読むのがおすすめです。

- [docs/react-basics.md](./docs/react-basics.md) — このアプリの実際のコードを使って、Reactの基本的な考え方(コンポーネント・state・propsなど)を説明しています
- [docs/claude-code-basics.md](./docs/claude-code-basics.md) — `CLAUDE.md`やAgents/Skillsなど、Claude Codeがこのリポジトリを扱うための仕組みを説明しています
- [docs/development-flow.md](./docs/development-flow.md) — 各ドキュメントの役割と、Issue作成からPRマージまでの開発の流れをまとめています

## 機能

- 収支の入力(日付・内容・金額・収支種別・カテゴリ)
- 一覧表示(行クリックでその場編集、削除)
- 月別の絞り込み・内容検索・並び替え
- 収入・支出・差引の合計サマリー、カテゴリ別集計グラフ

## フォルダ構成

```
.
├── CLAUDE.md          # Claude Code向けの開発ガイド(詳しくはdocs/claude-code-basics.md)
├── README.md          # このファイル
├── docs/              # 学習メモなど
├── .devcontainer/     # 開発用コンテナ設定(Node.js + ローカルPostgres)
├── .github/workflows/ # PRビルドチェック(GitHub Actions)
└── project/           # アプリ本体(Next.js)
    ├── src/app/       # ページ・APIルート(App Router)
    ├── src/lib/       # 共有ロジック(カテゴリ定義・バリデーションなど)
    └── prisma/        # DBスキーマ・マイグレーション
```

アプリのコードはすべて `project/` 配下にあります。

## このプロジェクトで使っている技術

技術用語がわからなくても大丈夫なように、それぞれ簡単に説明します。

### フロントエンド(画面まわり)

- **React** — 画面の部品(コンポーネント)を組み合わせてUIを作るためのJavaScriptライブラリ
- **Next.js** — Reactを使ったWebアプリを作りやすくするフレームワーク。ページのルーティング(URLごとに表示する画面を切り替える仕組み)やサーバー側の処理も含めて面倒を見てくれる

### ホスティング(公開先)

- **Cloudflare Pages** — 作ったアプリをインターネット上に公開するためのサービス

### API(データのやり取り)

- **Cloudflare Functions** — ブラウザからのリクエストを受けて、DBの読み書きなどサーバー側の処理をするサーバーレス関数。「サーバーレス」とは、自分でサーバーを用意・管理しなくても、必要なときだけ処理が動く仕組みのこと

### バックエンド(DBとのやり取り)

- **Prisma** — データベースの構造(テーブルやカラム)をコードで定義し、変更を管理するためのツール(ORM)。このプロジェクトではDBの構造管理のためだけに使っていて、実際のデータの読み書きには使っていない(理由は[CLAUDE.md](./CLAUDE.md)参照)

### データベース

- **PostgreSQL** — データを保存するためのデータベースソフト
- **Neon** — PostgreSQLをサーバーレスで使えるようにしたクラウドサービス

## 開発環境を用意する

このプロジェクトは、VS Codeの**Dev Containers**という拡張機能を使って開発します。Dev Containersは「必要なソフト(Node.js、PostgreSQLなど)が全部インストール済みの箱(コンテナ)」を自動で用意してくれる仕組みで、自分のPCを汚さずに開発を始められます。

1. VS Codeで「Dev Containers」拡張機能をインストールする
2. このリポジトリを開き、「コンテナーで再度開く」を選ぶ(`.devcontainer`フォルダの設定が自動で読み込まれます)
3. コンテナが起動したら、ターミナルで以下を実行する

```bash
cd project
yarn install
yarn dev
```

4. ブラウザで `http://localhost:3000` を開くと確認できます

DB接続まわりの制約(Edge Runtime・本番/ローカルDBの分離)や開発時の注意点は [CLAUDE.md](./CLAUDE.md) にまとめています。
