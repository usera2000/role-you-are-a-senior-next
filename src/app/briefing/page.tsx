import ArticleListPanel from "@/components/ArticleListPanel";
import ChatTopics from "@/components/ChatTopics";
import Header from "@/components/Header";
import WeatherCard from "@/components/WeatherCard";
import { getWeather } from "@/lib/weather";
import { getDashboardNews } from "@/lib/rss";
import { flattenGroupedNews, selectMainNews, topByCategory } from "@/lib/newsroom";

export const revalidate = 600;

export default async function BriefingPage() {
  const [{ grouped, chatTopics }, weather] = await Promise.all([getDashboardNews(), getWeather()]);
  const mainNews = selectMainNews(flattenGroupedNews(grouped));

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-[1760px] space-y-6 px-8 py-8">
        <section className="rounded-md border border-blue-200 bg-white p-7 shadow-newsroom">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-primary">Daily Briefing</p>
          <h1 className="mt-1 text-4xl font-black text-text">브리핑 페이지</h1>
          <p className="mt-3 text-xl font-semibold text-slate-600">날씨, 메인 뉴스, 주요 카테고리를 한 페이지에서 확인합니다.</p>
        </section>

        <WeatherCard cities={weather.cities} error={weather.error} />
        {mainNews ? <ArticleListPanel title="🔥 오늘의 메인 뉴스" articles={[mainNews]} /> : null}
        <div className="grid gap-5 xl:grid-cols-2">
          <ArticleListPanel title="Hot News" articles={topByCategory(grouped, "핫이슈", 4)} />
          <ArticleListPanel title="Games" articles={topByCategory(grouped, "게임", 4)} />
          <ArticleListPanel title="Products" articles={topByCategory(grouped, "신제품 · 신메뉴", 4)} />
          <ArticleListPanel title="Anime" articles={topByCategory(grouped, "애니 · 만화", 4)} />
          <ArticleListPanel title="IT" articles={topByCategory(grouped, "IT", 4)} />
        </div>
        <ChatTopics topics={chatTopics} />
        <section className="rounded-md border border-border bg-white p-7 shadow-newsroom">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-primary">오늘의 한마디</p>
          <blockquote className="mt-3 text-3xl font-black leading-snug text-text">
            오늘의 뉴스는 빠르게 보고, 중요한 이야기는 시청자와 함께 천천히 나눕니다.
          </blockquote>
        </section>
      </main>
    </div>
  );
}
