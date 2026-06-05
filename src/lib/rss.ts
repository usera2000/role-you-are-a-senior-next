import Parser from "rss-parser";
import { buildDailyChatTopics, enrichArticlesWithSummaries } from "@/lib/summary";

export type NewsCategory =
  | "전국 날씨"
  | "핫이슈"
  | "신제품 · 신메뉴"
  | "게임"
  | "할인 · 특가"
  | "애니 · 만화"
  | "IT"
  | "커뮤니티 화제글"
  | "유머"
  | "오늘의 채팅 주제";

export type NewsArticle = {
  id: string;
  category: NewsCategory;
  priorityTag: "HOT" | "TREND" | "NEW";
  title: string;
  source: string;
  publishedAt: string;
  summary: string;
  aiSummary: string;
  talkingPoint: string;
  url: string;
  thumbnail: string;
};

type FeedConfig = {
  category: NewsCategory;
  source: string;
  url: string;
  include?: string[];
  limit?: number;
};

type CustomItem = Parser.Item & {
  "content:encoded"?: string;
  "media:content"?: { $?: { url?: string } } | Array<{ $?: { url?: string } }>;
  "media:thumbnail"?: { $?: { url?: string } } | Array<{ $?: { url?: string } }>;
  enclosure?: { url?: string };
};

const parser = new Parser<Record<string, unknown>, CustomItem>({
  timeout: 9000,
  customFields: {
    item: [
      ["content:encoded", "content:encoded"],
      ["media:content", "media:content"],
      ["media:thumbnail", "media:thumbnail"],
    ],
  },
});

const forbiddenKeywords = [
  "정치",
  "국회",
  "대통령",
  "대선",
  "총선",
  "선거",
  "정당",
  "민주당",
  "국민의힘",
  "개혁신당",
  "조국혁신당",
  "정부 갈등",
  "정권",
  "탄핵",
  "후보",
  "트럼프",
  "북중",
  "북한",
  "비핵화",
  "한반도",
  "외교",
  "안보",
  "군사",
  "침공",
  "전쟁",
  "러시아",
  "우크라이나",
  "이스라엘",
  "팔레스타인",
  "종교",
  "교회",
  "불교",
  "천주교",
  "기독교",
  "이념",
  "좌파",
  "우파",
  "보수",
  "진보",
  "갈등",
  "분쟁",
  "시위",
];

const feeds: FeedConfig[] = [
  {
    category: "핫이슈",
    source: "연합뉴스",
    url: "https://www.yna.co.kr/rss/news.xml",
    limit: 5,
  },
  {
    category: "핫이슈",
    source: "뉴시스",
    url: "https://www.newsis.com/RSS/sokbo.xml",
    limit: 4,
  },
  {
    category: "신제품 · 신메뉴",
    source: "한국경제",
    url: "https://www.hankyung.com/feed/all-news",
    include: ["신제품", "신메뉴", "한정 메뉴", "신상 음료", "편의점 신상", "신규 출시", "한정판", "출시", "편의점", "카페", "음료", "디저트", "식품"],
    limit: 6,
  },
  {
    category: "신제품 · 신메뉴",
    source: "뉴시스",
    url: "https://www.newsis.com/RSS/sokbo.xml",
    include: ["신제품", "신메뉴", "한정 메뉴", "신상 음료", "편의점 신상", "신규 출시", "한정판", "출시", "편의점", "카페", "음료", "디저트", "식품"],
    limit: 6,
  },
  {
    category: "신제품 · 신메뉴",
    source: "연합뉴스",
    url: "https://www.yna.co.kr/rss/news.xml",
    include: ["신제품", "신메뉴", "한정 메뉴", "신상 음료", "편의점 신상", "신규 출시", "한정판", "출시", "편의점", "카페", "음료", "디저트", "식품"],
    limit: 6,
  },
  {
    category: "게임",
    source: "인벤",
    url: "https://www.inven.co.kr/webzine/news/rss.php",
    include: ["게임", "온라인", "콘솔", "스팀", "닌텐도", "플스", "RPG", "출시", "업데이트"],
    limit: 6,
  },
  {
    category: "게임",
    source: "루리웹",
    url: "https://bbs.ruliweb.com/news/rss",
    include: ["게임", "플스", "닌텐도", "스팀", "Xbox", "RPG", "출시", "업데이트"],
    limit: 4,
  },
  {
    category: "할인 · 특가",
    source: "뽐뿌",
    url: "https://www.ppomppu.co.kr/rss.php?id=ppomppu",
    include: ["특가", "할인", "쿠폰", "무료", "행사", "핫딜", "세일", "원"],
    limit: 6,
  },
  {
    category: "애니 · 만화",
    source: "루리웹",
    url: "https://bbs.ruliweb.com/news/rss",
    include: ["애니", "만화", "웹툰", "굿즈", "피규어", "성우", "극장판", "캐릭터"],
    limit: 6,
  },
  {
    category: "IT",
    source: "전자신문",
    url: "https://rss.etnews.com/Section902.xml",
    include: ["AI", "반도체", "스마트폰", "앱", "서비스", "기기", "플랫폼", "보안", "인터넷", "기술"],
    limit: 6,
  },
  {
    category: "커뮤니티 화제글",
    source: "뽐뿌",
    url: "https://www.ppomppu.co.kr/rss.php?id=freeboard",
    limit: 5,
  },
  {
    category: "유머",
    source: "뽐뿌",
    url: "https://www.ppomppu.co.kr/rss.php?id=humor",
    limit: 5,
  },
  {
    category: "오늘의 채팅 주제",
    source: "전자신문",
    url: "https://rss.etnews.com/Section901.xml",
    include: ["화제", "인기", "트렌드", "신기", "공개", "출시", "랭킹", "체험", "AI"],
    limit: 5,
  },
];

const fallbackImages: Record<NewsCategory, string> = {
  "전국 날씨": "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=900&q=80",
  "핫이슈": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80",
  "신제품 · 신메뉴": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
  게임: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80",
  "할인 · 특가": "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=900&q=80",
  "애니 · 만화": "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=900&q=80",
  IT: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  "커뮤니티 화제글": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
  유머: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80",
  "오늘의 채팅 주제": "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80",
};

const categories: NewsCategory[] = [
  "전국 날씨",
  "핫이슈",
  "신제품 · 신메뉴",
  "게임",
  "할인 · 특가",
  "애니 · 만화",
  "IT",
  "커뮤니티 화제글",
  "유머",
  "오늘의 채팅 주제",
];

export async function getDashboardNews() {
  const articles = await enrichArticlesWithSummaries(await getNewsArticles());
  const grouped = categories.reduce(
    (acc, category) => {
      acc[category] = articles.filter((article) => article.category === category).slice(0, 6);
      return acc;
    },
    {} as Record<NewsCategory, NewsArticle[]>,
  );

  return { grouped, categories, chatTopics: buildDailyChatTopics(articles) };
}

async function getNewsArticles() {
  const settled = await Promise.allSettled(feeds.map(fetchFeedArticles));
  return settled
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

async function fetchFeedArticles(feed: FeedConfig): Promise<NewsArticle[]> {
  const parsed = await parseFeed(feed.url);
  const seen = new Set<string>();

  return parsed.items
    .filter((item) => item.title && isValidArticleUrl(item.link))
    .filter((item) => matchesInclude(item, feed.include))
    .filter((item) => !containsForbidden(`${item.title} ${item.contentSnippet ?? ""} ${item.content ?? ""}`))
    .map((item) => toArticle(item, feed))
    .filter((article) => {
      if (!isValidArticleUrl(article.url) || seen.has(article.url)) return false;
      seen.add(article.url);
      return true;
    })
    .slice(0, feed.limit ?? 6);
}

async function parseFeed(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 ChoiAeriNewsroomRSSReader",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
    next: { revalidate: 600 },
  });

  if (!response.ok) {
    throw new Error(`RSS request failed: ${response.status} ${url}`);
  }

  const xml = await response.text();
  if (!/^\s*(<\?xml|<rss|<feed)/i.test(xml)) {
    throw new Error(`RSS response is not XML: ${url}`);
  }

  return parser.parseString(xml);
}

function toArticle(item: CustomItem, feed: FeedConfig): NewsArticle {
  const publishedAt = item.isoDate || item.pubDate || new Date().toISOString();
  const text = cleanText(item.contentSnippet || item.content || item.summary || "");

  return {
    id: `${feed.source}-${item.guid || item.link}`,
    category: feed.category,
    priorityTag: getPriorityTag(feed.category, item.title || "", publishedAt),
    title: cleanText(item.title || "제목 없음"),
    source: feed.source,
    publishedAt,
    summary: summarize(text),
    aiSummary: "",
    talkingPoint: "",
    url: item.link || "",
    thumbnail: extractImage(item) || fallbackImages[feed.category],
  };
}

function getPriorityTag(category: NewsCategory, title: string, publishedAt: string): NewsArticle["priorityTag"] {
  const ageHours = (Date.now() - new Date(publishedAt).getTime()) / 36e5;
  if (category === "핫이슈" || /속보|단독|화제|논란|인기/.test(title)) return "HOT";
  if (category === "신제품 · 신메뉴" || /신제품|신메뉴|신상|출시|공개|한정판/.test(title)) return "NEW";
  if (ageHours <= 12 || /트렌드|랭킹|인기|커뮤니티|챌린지/.test(title)) return "TREND";
  return "TREND";
}

function matchesInclude(item: CustomItem, include?: string[]) {
  if (!include?.length) return true;
  const haystack = `${item.title ?? ""} ${item.contentSnippet ?? ""} ${item.content ?? ""}`.toLowerCase();
  return include.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

function containsForbidden(text: string) {
  const normalized = text.toLowerCase();
  return forbiddenKeywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function isValidArticleUrl(url?: string) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function extractImage(item: CustomItem) {
  const mediaContent = Array.isArray(item["media:content"]) ? item["media:content"][0] : item["media:content"];
  const mediaThumbnail = Array.isArray(item["media:thumbnail"])
    ? item["media:thumbnail"][0]
    : item["media:thumbnail"];
  const fromMedia = mediaContent?.$?.url || mediaThumbnail?.$?.url;
  const fromEnclosure = item.enclosure?.url;
  const html = item.content || item["content:encoded"];
  const fromHtml = html?.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];

  return fromMedia || fromEnclosure || fromHtml || "";
}

function cleanText(text: string) {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function summarize(text: string) {
  if (!text) return "RSS 원문 요약이 제공되지 않았습니다. 원문 링크에서 자세한 내용을 확인하세요.";
  return text.length > 118 ? `${text.slice(0, 118)}...` : text;
}
