# 최애리 뉴스룸

Korean VTuber 방송용 데스크톱 뉴스 대시보드 MVP입니다. 실제 한국 RSS 피드를 읽어 카드로 보여주며, 모든 기사는 원문 링크를 새 탭으로 엽니다.

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- App Router
- shadcn/ui style primitives
- Framer Motion
- rss-parser

## Run

```bash
npm install
npm run dev
```

PowerShell 실행 정책으로 `npm`이 막히면 Windows에서 다음처럼 실행할 수 있습니다.

```bash
npm.cmd install
npm.cmd run dev
```

## RSS sources

The app uses Korean RSS feeds only, including:

- 연합뉴스
- 뉴시스
- 한국경제
- 전자신문
- 인벤
- 루리웹
- 뽐뿌

Politics, elections, religion, ideology, and conflict-heavy keywords are filtered before rendering. If a feed is unavailable or a category has no safe article, the section shows an empty state instead of fake content.

## AI summaries

Create `.env.local` and set:

```bash
OPENAI_API_KEY=your_api_key
```

When `OPENAI_API_KEY` is present, the server generates short Korean AI summaries and one-sentence broadcast talking points for RSS articles. Without a key, the app still renders real RSS articles and uses safe RSS-based fallback text instead of fake articles.

## Weather

Weather APIs, scraping, and RSS weather parsing are intentionally disabled in Version 2. The weather section displays static city cards with `날씨 준비중` until a future weather implementation is added.
