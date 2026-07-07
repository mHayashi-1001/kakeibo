---
name: feature-branch
description: kakeiboリポジトリのGitHub Flowに沿って、Issueに対応するfeature/#<issue番号>ブランチの作成から、PR作成(Closes #Nを含む)までを一貫して行う。「issue #Nの作業を始めたい」「ブランチ切って」「PR出して」といった依頼で使う。
---

# feature-branch

kakeiboのGitワークフロー(CLAUDE.md参照)を実行するスキル。GitHub Flow: `main`から`feature/#<issue番号>`ブランチを切り、作業後に`main`へPRを出す。`main`は直push禁止・ビルド成功(`project/`で`yarn build`)が必須。

## ブランチ作成

1. Issue番号が指示されていなければ、`gh issue list` で確認するかユーザーに尋ねる。
2. `git status` で作業ツリーがクリーンか確認する。未コミットの変更があれば、それがこれから始める作業と無関係なら先にユーザーに相談する(勝手にstash/破棄しない)。
3. 最新の`main`を取得する:
   ```
   git fetch origin main
   git checkout main
   git pull origin main
   ```
4. ブランチを作成する:
   ```
   git checkout -b feature/#<issue番号> main
   ```
   ブランチ名はリテラルに`#`を含む(例: `feature/#32`)。

## PR作成

1. 変更をコミットする(コミットメッセージは通常のcommitの指示に従う。ユーザーの明示的な依頼がある場合のみコミットする)。
2. リモートにpushする: `git push -u origin feature/#<issue番号>`
3. PR本文に必ず `Closes #<issue番号>` を含め、何を・なぜ変更したかを簡潔にまとめる。
4. `gh pr create --title "..." --body "$(cat <<'EOF' ... EOF)"` の形式でPRを作成する。
5. CIは`.github/workflows/pr-build.yml`が`project/`で`yarn lint`・`yarn test`・`yarn build`を順に実行する。事前に`project/`でこの3つを実行し、通ることを確認してからPRを作成するとやり直しが減る。

## 注意

- push・PR作成はユーザーに影響が及ぶ操作なので、実行前に対象ブランチ・PR内容を確認してから進める。
- `main`への直接pushやforce pushは行わない(ブランチ保護されている)。
