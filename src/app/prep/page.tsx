import ArticleListPanel from "@/components/ArticleListPanel";
import ChatTopics from "@/components/ChatTopics";
import Header from "@/components/Header";
import { getDashboardNews } from "@/lib/rss";
import { flattenGroupedNews, selectMainNews, topByCategory } from "@/lib/newsroom";

export const revalidate = 600;

export default async function PrepPage() {
  const { grouped, chatTopics } = await getDashboardNews();
  const mainNews = selectMainNews(flattenGroupedNews(grouped));

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-[1760px] space-y-6 px-8 py-8">
        <section className="rounded-md border border-blue-200 bg-white p-7 shadow-newsroom">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-primary">방송 준비</p>
          <h1 className="mt-1 text-4xl font-black text-text">준비 페이지</h1>
          <p className="mt-3 text-xl font-semibold text-slate-600">최애리 방송 전 핵심 뉴스와 카테고리별 우선 기사를 점검합니다.</p>
        </section>

        {mainNews ? <ArticleListPanel title="오늘의 메인 뉴스" articles={[mainNews]} /> : null}
        <div className="grid gap-5 xl:grid-cols-2">
          <ArticleListPanel title="Top Game News" articles={topByCategory(grouped, "게임", 3)} />
          <ArticleListPanel title="Top IT News" articles={topByCategory(grouped, "IT", 3)} />
          <ArticleListPanel title="Top Product News" articles={topByCategory(grouped, "신제품 · 신메뉴", 3)} />
          <ArticleListPanel title="Top Anime News" articles={topByCategory(grouped, "애니 · 만화", 3)} />
        </div>
        <ChatTopics topics={chatTopics} />
      </main>
    </div>
  );
}
