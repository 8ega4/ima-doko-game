# いま、どこ？

消えたボールの位置を当てる、スマートフォン向けのワンタップブラウザゲームです。1プレイは5ラウンド、500点満点、約25秒です。

プレイ: https://ima-doko-game.pages.dev/

紹介LP: https://ima-doko-game.pages.dev/lp/

## 開発

```bash
npm install
npm run dev
```

## 検証

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Cloudflare Pages

`main` へのpush時にGitHub Actionsが検証とbuildを行い、Cloudflare PagesのDirect Uploadプロジェクト `ima-doko-game` へ本番公開します。GitHub Actionsには `CLOUDFLARE_ACCOUNT_ID` と、対象アカウントのCloudflare Pages編集権限だけを持つ `CLOUDFLARE_API_TOKEN` が必要です。

緊急時は、ローカルのWrangler認証から同じプロジェクトへ手動公開できます。

```bash
npm run deploy:cloudflare
```

公開先は `https://ima-doko-game.pages.dev/`、production branchは `main`、build outputは `dist` です。デプロイにはCloudflare Pages編集権限を持つWrangler認証が必要です。

旧GitHub Pages URL `https://8ega4.github.io/ima-doko-game/` は、mainブランチへのpush時に `.github/workflows/deploy-pages.yml` からリダイレクト専用ページを公開します。TOP、`/lp/`、query、hashをCloudflare Pagesへ引き継ぎます。

## 仕様

- URLの `?seed=...` で速度・角度・反射・消失時間を含む同じ5ラウンドを再現
- ラウンドごとに速度と予測難易度が上がり、ROUND 5は最高速度のFINAL ROUND
- localStorageには自己ベストとミュート設定のみ保存
- Web Share API対応環境では結果画像を共有
- X Web IntentではテキストとチャレンジURLを共有
- ログイン、API、データベース、グローバルランキングは不使用

ビジュアル仕様は `docs/design/`、実装要件は `IMPLEMENTATION_PROMPT.md` を参照してください。

ゲーム本体は `/`、紹介LPは `/lp/` で表示されます。LPのセクション別コンセプトと実装比較は `docs/design/lp/` にまとめています。
