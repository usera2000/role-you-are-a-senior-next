import type { NewsArticle, NewsCategory } from "@/lib/rss";

export function flattenGroupedNews(grouped: Record<NewsCategory, NewsArticle[]>) {
  return Object.values(grouped).flat();
}

export function selectMainNews(articles: NewsArticle[]) {
  return [...articles].sort((a, b) => scoreArticle(b) - scoreArticle(a))[0] || null;
}

export function topByCategory(
  grouped: Record<NewsCategory, NewsArticle[]>,
  category: NewsCategory,
  limit = 3,
) {
  return [...(grouped[category] || [])].sort((a, b) => scoreArticle(b) - scoreArticle(a)).slice(0, limit);
}

export function scoreArticle(article: NewsArticle) {
  const categoryScore: Record<NewsCategory, number> = {
    "전국 날씨": 0,
    핫이슈: 100,
    "신제품 · 신메뉴": 86,
    게임: 82,
    IT: 78,
    "애니 · 만화": 72,
    "커뮤니티 화제글": 62,
    유머: 48,
    "할인 · 특가": 60,
    "오늘의 채팅 주제": 50,
  };
  const tagScore = article.priorityTag === "HOT" ? 30 : article.priorityTag === "NEW" ? 18 : 12;
  const ageHours = Math.max(0, (Date.now() - new Date(article.publishedAt).getTime()) / 36e5);
  const freshnessScore = Math.max(0, 24 - ageHours);

  return (categoryScore[article.category] || 0) + tagScore + freshnessScore;
}
