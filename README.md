# school-mvp-lab

学校関連の小型MVPを無料公開し、実際に使える小型MVPや利用者の反応から需要を検証するための実験場です。

完成された大規模アプリを先に作るのではなく、学校生活の「困りごとあるある」から小さなテーマを切り出し、1ページずつ軽く公開します。対象として、外国人保護者、日本語が苦手な保護者、学校支援者、留学生・学生などを想定しています。

> [!IMPORTANT]
> このサイトは、学校・自治体・教育委員会の公式サービスではありません。名前、住所、電話番号、学校名、児童生徒名などの個人情報は、できるだけ隠して利用する方針です。

## 想定テーマ

- [学校プリント重要点チェッカー](experiments/school-print-checker/)
  - 貼り付けた文章をブラウザ内JavaScriptで簡易分析し、「いつ・どこで・持ち物・提出物・お金・返信・保護者がすること」を整理する
- [欠席・遅刻連絡メーカー](experiments/absence-message-maker/)
  - 状況から、先生へ送る自然な日本語文を作る
- [学校用語やさしい日本語辞典](experiments/school-terms-dictionary/)
  - PTA、懇談会、集金、提出期限、持ち物などをやさしく説明する
- [学校行事持ち物チェックリスト](experiments/event-items-checklist/)
  - 遠足、運動会、授業参観などの準備物を整理する

テーマに応じて、まずはブラウザ内で動く最小機能または説明ページから始め、具体的な反応が確認できたものだけを次の実装へ進めます。

## 静的サイト構成

```text
.
├── index.html
├── privacy.html
├── style.css
├── cloudflare/
│   └── _headers
├── scripts/
│   └── build-static.mjs
└── experiments/
    ├── school-print-checker/
    │   ├── index.html
    │   ├── checker.js
    │   └── checker.test.cjs
    ├── absence-message-maker/
    │   └── index.html
    ├── school-terms-dictionary/
    │   └── index.html
    └── event-items-checklist/
        └── index.html
```

ルート直下の `index.html` が実験場トップです。既存のNext.js製School Letter Helperプロトタイプ（`app/`、`components/` など）と、多言語の検証用LP（`en.html`、`pt.html`、`public/lp/`）は、過去の検証資産として残しています。

## デプロイ想定

静的ファイルを `dist/` にまとめ、Cloudflare Pagesで公開する構成です。ビルドはNext.jsアプリを対象にせず、実験場として公開するHTML、CSS、JavaScript、OGP画像、サイトマップ、Cloudflare用ヘッダーだけをコピーします。

```bash
npm run build:static
```

Cloudflareのダッシュボードでは、**WorkersではなくPagesを選択**してGitリポジトリを連携します。このリポジトリは静的サイトであり、WorkerやPages Functionsを使用しません。**Bindingsは追加せず**、Worker向けの `wrangler deploy` も使用しないでください。

Cloudflare PagesのGit連携では、次の値に統一します。

| 設定 | 値 |
| --- | --- |
| Project name | `school-mvp-lab` |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `npm run build:static` |
| Build output directory | `dist` |
| Root directory | 空欄 |
| Bindings | なし |

デプロイはPagesのGit連携に任せます。`wrangler.toml`、`wrangler.json`、`wrangler.jsonc` は追加せず、`wrangler deploy` やWorker用のデプロイスクリプトも使用しません。

プロジェクト名を取得できた場合の公開URLは `https://school-mvp-lab.pages.dev/` です。初回デプロイ後は、トップページ、`privacy.html`、`experiments/school-print-checker/` を実際の公開URLとスマートフォンで確認します。

`cloudflare/_headers` はビルド時に `dist/_headers` へコピーされ、静的レスポンスに基本的なセキュリティヘッダーを付与します。`dist/` は生成物のためGit管理しません。

## 開発方針

- 1テーマ1ページ
- まずは静的HTML/CSS/JavaScriptで軽く作る
- Web完結の最小機能、画面内フィードバック、フォームやヒアリングで需要を先に確認する
- AI自動処理やOCRは、需要が見えてから実装する
- 学校プリント重要点チェッカーは、現在は日本の学校プリントでよく使われる語句をもとにしたルールベースの簡易抽出
- チェッカーはブラウザ内JavaScriptだけで処理し、入力内容や結果を保存・外部送信しない
- 外部API、AI API、OCR、DB、画像アップロード、秘密鍵、`.env`、APIキーを初期検証では使わない
- 個人情報を扱わない、または取得項目を最小化する
- 学校からの案内や先生による最終確認を必ず促す

## 検証指標

- フォーム送信数
- 実際に困りごとを送ってくれた人数
- SNSでの保存・返信・共有
- **2週間で3件以上の具体的反応があれば継続候補**

ページ閲覧数だけで判断せず、「どの場面で困ったか」「何を試したいか」などの具体的な反応を重視します。

## ローカル確認

外部APIやビルドは不要です。リポジトリルートで簡易HTTPサーバーを起動します。

```bash
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000/` を開き、トップページ、各実験ページ、プライバシーポリシーへのリンクを確認します。

学校プリント重要点チェッカーのルールベース抽出テストは、次のコマンドで実行できます。

```bash
npm run test:checker
```

## 次の作業

1. 学校プリント重要点チェッカーを実際のプリント例で試し、簡易抽出ルールを改善する
2. 画面内フィードバックを、個人情報を集めない集計方法へ接続するか判断する
3. ほかのテーマは、必要に応じて検証フォームまたはWeb完結の最小機能を用意する
4. 2週間単位で反応を記録し、3件以上の具体的反応が集まったテーマを改善する
5. AIやOCRが本当に必要と分かってから、安全な実装方法を検討する
