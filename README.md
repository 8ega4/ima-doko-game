# いま、どこ？

消えたボールの位置を当てる、スマートフォン向けのワンタップブラウザゲームです。1プレイは3ラウンド、約15〜18秒です。

プレイ: https://8ega4.github.io/ima-doko-game/

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

## GitHub Pages

リポジトリ名を `ima-doko-game` とした設定です。

```bash
GITHUB_PAGES=true npm run build
```

mainブランチへのpush時は `.github/workflows/deploy-pages.yml` が検証・ビルド・公開を自動実行します。GitHubのリポジトリ設定で Pages のソースを「GitHub Actions」にしてください。別のリポジトリ名にする場合は `vite.config.ts` の `base` を変更します。

公開先が `https://8ega4.github.io/ima-doko-game/` 以外の場合は、`index.html` の `og:url` と `og:image` も公開URLに合わせて変更してください。

## 仕様

- URLの `?seed=...` で同じ3ラウンドを再現
- localStorageには自己ベストとミュート設定のみ保存
- Web Share API対応環境では結果画像を共有
- X Web IntentではテキストとチャレンジURLを共有
- ログイン、API、データベース、グローバルランキングは不使用

ビジュアル仕様は `docs/design/`、実装要件は `IMPLEMENTATION_PROMPT.md` を参照してください。
