# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

家計簿アプリ。アプリのコードはすべて `project/`(Next.js + Prisma + Neon Postgres)に置いており、リポジトリ直下にはこのファイルとCI設定以外のコードはない。

## コマンド

すべて `project/` から実行する。

```bash
yarn install
yarn dev          # next dev --turbopack, http://localhost:3000
yarn build        # next build(PRの必須CIチェックと同じ)
yarn start
yarn lint
yarn test         # vitest run。src/lib配下のロジック(validate.ts/categories.ts)のユニットテスト
npx tsc --noEmit  # 型チェック。専用スクリプトはない
```

`yarn lint`・`yarn test`・`yarn build`はいずれも`.github/workflows/pr-build.yml`のPR必須チェック。Edge Runtime依存(`neon()`経由)のAPIルート自体はテスト対象外(詳細は後述)。

Prisma(スキーマ・マイグレーション管理のみ。ランタイムで使わない理由は後述):

```bash
npx prisma migrate dev --name <name>   # マイグレーションを作成・適用(ローカルPostgres)
npx prisma migrate deploy              # 未適用のマイグレーションを本番に適用
npx prisma generate                    # src/generated/prisma(gitignore対象)にクライアントを再生成
```

### ホストにLinux用Node.jsがない場合

ホストマシンにLinux用のNode.js/npm/yarnが入っていないことがある(WSL経由でWindows側のnodeが見えるがパス変換で失敗する。またNext.jsのEdge Runtimeサンドボックスでは`pg`のようなものはそもそも動かない)。代わりにdevcontainerを使う。

```bash
docker start kakeibo_devcontainer-app-1   # コンテナ名は環境によって異なる場合がある。`docker ps -a`で確認
docker exec kakeibo_devcontainer-app-1 sh -c "cd /workspaces/kakeibo/project && <command>"
```

devcontainerの`app`サービスは`db`サービスとネットワーク名前空間を共有している(`.devcontainer/docker-compose.yml`の`network_mode: service:db`)。そのため`app`コンテナ内から`localhost:5432`でローカルPostgresに直接アクセスできる。

## 重要な制約: Edge Runtimeのため`neon()`を使っている(Prisma/`pg`は使えない)

`src/app/api/*/route.ts` 配下の全ルートは `export const runtime = "edge"` を宣言している。これはCloudflare Pagesに`@cloudflare/next-on-pages`経由でデプロイするために必須(`wrangler.toml`参照)。next-on-pagesの関数はEdge Runtimeでしか動かない。

Edge Runtime(実際のCloudflare Workersも、Next.jsのローカル開発用サンドボックスも)は生のTCP/TLSソケット(`net`/`tls`)を扱えない。このため標準の`pg`ドライバ(実際に試したところ`Module not found: Can't resolve 'util/types'`でビルド失敗することを確認済み)や、Prisma Clientの標準クエリエンジンは使えない。そのため各APIルートは、SQLをHTTPS fetch経由で実行する`@neondatabase/serverless`の`neon()`タグ付きテンプレート関数を使って直接SQLを書いている。

**`neon()`は実際のNeonクラウドエンドポイントに対してしか動作しない。** 素のローカルPostgresには接続できず、`NeonDbError: ... TypeError: fetch failed`で失敗する。ローカルPostgresに対してこのエラーが出るのは想定通りの制約であり、追いかけて直すべきバグではない。

`prisma/schema.prisma` と `prisma/migrations/` は引き続きDBスキーマの正とする(source of truth)。Prisma Clientは`src/generated/prisma`(gitignore対象)に生成されるが、上記の理由によりAPIルートのランタイムでは使っていない。`@prisma/adapter-neon`はインストールされているが配線されていない依存関係で、これを配線してもローカル開発の問題は解決しない(内部的には結局Neon独自のHTTP/WSプロトコルを使うため、素のPostgresワイヤープロトコルには対応しない)。

本番に触れずにスキーマ・クエリのロジックをローカルで検証したい場合は、Next.jsのルートを経由せず、素の`node`で実行する使い捨てスクリプトの中でPrisma Clientを直接使うとよい。Prismaの標準エンジンは通常のPostgresワイヤー接続を使うため、ローカルのdocker-compose Postgresに対して問題なく動く。

## 本番DBについて: 開発用DBとの分離なし

`project/.env`の`DATABASE_URL`は実際の本番Neon DBを指しており、ステージング用DBは存在しない。docker-composeの`db`サービス(`postgresql://postgres:postgres@localhost:5432/postgres`)がローカル実験の唯一安全な接続先。ローカルでスクリプトやPrismaコマンドを実行する際は**`DATABASE_URL`を明示的に上書きする**こと。上書きしないと気づかないうちに本番に接続してしまう。

スキーマ変更の進め方: まずローカルPostgresに対してマイグレーションを作成・適用(`prisma migrate dev`)し、レビュー・マージを経てから、本番への適用(`prisma migrate deploy`)は別途行う。これは自動的に行わず、実行前に必ず確認を取るべき高リスクな操作として扱うこと。

本番の`item`テーブルはPrismaのマイグレーション記録なしに事前に存在していたため、一度だけ`prisma migrate resolve --applied <migration>`によるbaseline(既に適用済みとして記録する操作)が必要だった。`prisma migrate status`で、実際にはスキーマに反映済みのはずの古いマイグレーションが「未適用」と表示された場合は、この経緯が原因。

## アプリの構成

- `src/app/page.tsx` — トップページ。`/entry`と`/list`へのリンク
- `src/app/entry/page.tsx` — 収支を追加するフォーム(クライアントコンポーネント、`/api/insert`にPOST)
- `src/app/list/page.tsx` — 一覧画面。行をクリックしてその場編集(`/api/update`/`/api/delete`を呼ぶ)、月別絞り込み・内容検索・並び替え(日付/金額)、収入/支出/差引の合計サマリー表示
- `src/app/api/{search,insert,update,delete}/route.ts` — `item`テーブル(`id`, `date`, `name`, `price`, `category`, `type`)に対するCRUD
- `src/lib/validate.ts` — insert/update/delete共通のバリデーション(`validateItemFields`/`validateId`)。ユニットテスト(`validate.test.ts`)あり
- `src/lib/categories.ts` — 収支種別`ITEM_TYPES`(収入/支出)とカテゴリ候補`CATEGORIES_BY_TYPE`を共有定義。APIのバリデーションとentry/list画面のUI両方から参照することで、クライアント/サーバー間でカテゴリの許容値がずれないようにしている
- `src/components/CategoryBarChart.tsx` — /list画面のカテゴリ別集計を表示する横棒グラフ(単色・直接ラベル。詳細は`docs/react-basics.md`ではなくdataviz skillの方針を参照)
- `src/app/layout.tsx` — 全ページ共通のヘッダー・ナビゲーション

APIルートは全て `{ success: boolean, ... }` 形式のJSONを返す。失敗時は `{ success: false, error: string }` をHTTP 200で返す(エラーステータスコードは使わない)。

## Gitワークフロー

GitHub Flow: GitHub Issueに対応する `feature/#<issue番号>` という名前のブランチ(例: `feature/#15`)を切り、`main`へPRを出す。`main`はブランチ保護されており、直pushは禁止、ビルド成功(`.github/workflows/pr-build.yml`、`project/`で`yarn build`を実行)が必須。PR本文で `Closes #N` によりissueを参照する。

## Claude Code用のAgents / Skills

このリポジトリ専用のサブエージェント(`.claude/agents/`)とスキル(`.claude/skills/`)。それぞれ次の役割分担で使う。判断・レビューが必要なものはAgent、手順が決まっているものはSkillにしている。新しく追加・変更したときはこの表も合わせて更新すること。

### Agents(`.claude/agents/*.md`)

| 名前 | 用途 | 使うタイミング |
|---|---|---|
| `db-safety-guardian` | DBに触れるコマンド(`prisma migrate`、使い捨てスクリプト、`docker exec`経由の操作など)が本番Neonとローカルのどちらに接続するか判定し、危険なら警告する | `prisma migrate`系コマンドや、DB接続を含むスクリプトを実行する前に必ず |
| `react-tutor` | 実装したコードに含まれるReact/Next.js特有の概念を学習者向けに解説する。データ・処理の流れはMermaid図、抽象概念は身近なたとえ話で補足する(コード変更はしない) | 機能実装後の解説依頼や「これは何をしてるの」系の質問時 |

### Skills(`.claude/skills/<name>/SKILL.md`)

| 名前 | 用途 | 使うタイミング |
|---|---|---|
| `feature-branch` | `feature/#<issue番号>`ブランチの作成〜`Closes #N`を含むPR作成までを一貫して行う | Issue対応の作業を開始する時、PRを出す時 |
| `new-api-route` | 既存4ルート(`search`/`insert`/`update`/`delete`)の規約(Edge Runtime、`neon()`、`{ success, ... }`形式、`src/lib/validate.ts`のバリデーション再利用)に沿って新規APIルートを雛形作成する | `item`テーブルや新テーブルに対するAPIエンドポイントを追加する時 |

いずれもこのリポジトリ固有の制約(本番DB分離なし、Edge Runtime縛り、Gitワークフロー)を前提にしているため、CLAUDE.md本文の該当セクションを変更したときは、対応するAgent/Skillの記述が古くならないよう見直すこと。
