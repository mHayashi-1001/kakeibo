# ドキュメントの役割と開発の流れ

このリポジトリには複数のMarkdownファイルがあり、それぞれ役割が違う。ここでは「どのドキュメントが何のためにあるか」と、「Claude Codeと一緒に機能を追加するときの一連の流れ」をまとめる。

## ドキュメントの役割一覧

| ファイル | 誰向け | 役割 |
|---|---|---|
| [../README.md](../README.md) | 人間 | プロジェクトの入り口。何のアプリか、使っている技術、開発環境の準備方法 |
| [../project/README.md](../project/README.md) | 人間 | アプリ本体(`project/`)のコマンド早見表 |
| [react-basics.md](./react-basics.md) | 人間(React学習者) | このアプリの実コードを使ったReactの基本概念の解説 |
| [claude-code-basics.md](./claude-code-basics.md) | 人間(Claude Code初心者) | `CLAUDE.md`・Agents・Skillsがそれぞれ何をする仕組みかの解説 |
| [development-flow.md](./development-flow.md) | 人間 | このファイル。ドキュメントの役割と開発の流れのまとめ |
| [../CLAUDE.md](../CLAUDE.md) | Claude Code | 作業のたびに自動で読み込まれる、プロジェクト固有の前提知識(コマンド・制約・ルール) |
| [../.claude/agents/*.md](../.claude/agents/) | Claude Code | 特定の判断を任せる専門エージェント(DB安全確認・React解説) |
| [../.claude/skills/*/SKILL.md](../.claude/skills/) | Claude Code | 決まった手順を再現するための手順書(ブランチ作成〜PR、APIルート雛形作成) |

人間向けのドキュメントは「読んで理解する」もの、Claude Code向けのドキュメントは「作業の前提として自動的に使われる」ものという違いがある。

## 機能追加の流れ(実際にこのリポジトリで行っている手順)

このリポジトリでは、GitHub Flow([../CLAUDE.md](../CLAUDE.md)参照)に沿って、次の流れで機能を追加している。

1. **要望・アイデアを相談する**
   何を追加したいかを伝える。複数の案が考えられる場合は選択肢を提示してもらい、方向性を決める。ある程度規模のある変更は、実装前に「計画」を提示してもらい、内容を確認してから進める(Plan Mode)。

2. **GitHub Issueを作る**
   何を・なぜ追加するのかをIssueとして記録する。後から「なぜこの変更をしたのか」を追跡できるようにするため。

3. **作業用ブランチを作る**
   `main`から`feature/#<issue番号>`という名前のブランチを作る。`main`に直接変更を加えることはない([../.claude/skills/feature-branch/SKILL.md](../.claude/skills/feature-branch/SKILL.md)参照)。

4. **実装する**
   コードを書く。この開発環境ではホストにNode.jsが入っていないため、devcontainer(Docker)の中でコマンドを実行する([../CLAUDE.md](../CLAUDE.md)参照)。

5. **検証する**
   `npx tsc --noEmit`(型チェック)・`yarn lint`・`yarn test`を実行し、問題ないことを確認する。画面まわりの変更は、一時的なプレビュー用ページやモックデータを使って見た目を確認することもある。DBを触る変更は、本番Neon DBではなくローカルのPostgresに対して確認する([../.claude/agents/db-safety-guardian.md](../.claude/agents/db-safety-guardian.md)参照)。

6. **コミットしてPRを作る**
   変更内容をコミットし、GitHubにpushしてPull Request(PR)を作る。PRの説明には「何を・なぜ変更したか」と「Closes #<issue番号>」を書き、対応するIssueを自動でクローズできるようにする。

7. **CI(自動チェック)を確認する**
   PRを作ると、GitHub Actionsが自動で`yarn lint`・`yarn test`・`yarn build`を実行する([../.github/workflows/pr-build.yml](../.github/workflows/pr-build.yml))。すべて通ることを確認する。

8. **マージする**
   内容に問題がなければ、PRを`main`にマージする。マージ後はローカルの`main`を最新化し、不要になった作業ブランチを削除する。

9. **(DBのスキーマ変更がある場合)本番への適用**
   DBの構造を変えた場合、ローカルでのマイグレーション作成・検証とは別に、本番Neon DBへの適用は必ず事前に確認したうえで行う。本番とローカルのDBは分離されていないため、ここだけは自動化せず慎重に進める。

## この流れがなぜ重要か

Claude CodeのようなAIアシスタントと開発するときも、人間同士のチーム開発と同じように「変更の意図を記録し(Issue)、小さな単位で確認しながら進め(ブランチ・PR)、自動チェックで品質を保つ(CI)」という流れがあることで、後から見返しても何をなぜ変更したのかが追いやすくなる。AIが手を動かす速度が上がっても、この流れ自体を省略しないことが、安全に開発を進めるコツになる。
