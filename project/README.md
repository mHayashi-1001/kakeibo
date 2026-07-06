Next.js (App Router) 製の家計簿アプリ本体です。プロジェクト全体の概要は [ルートのREADME](../README.md) を、開発時の注意点は [CLAUDE.md](../CLAUDE.md) を参照してください。

## セットアップ

```bash
yarn install
yarn dev
```

[http://localhost:3000](http://localhost:3000) で確認できます。

## 主なコマンド

```bash
yarn dev          # 開発サーバー起動(Turbopack)
yarn build        # 本番ビルド(PRのCIチェックと同じ)
yarn lint         # ESLint
npx tsc --noEmit  # 型チェック
```

DBスキーマ変更時は `npx prisma migrate dev --name <name>` でマイグレーションを作成します。本番DBへの適用(`prisma migrate deploy`)は別途確認のうえ行ってください。
