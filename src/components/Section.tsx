import type { NewsArticle, NewsCategory } from "@/lib/rss";
import NewsCard from "@/components/NewsCard";
import type { NewsCardControls } from "@/components/BroadcastWorkspace";

export default function Section({
  category,
  articles,
  controls,
}: {
  category: NewsCategory;
  articles: NewsArticle[];
  controls?: NewsCardControls;
}) {
  if (category === "전국 날씨") return null;

  return (
    <section id={category} className="scroll-mt-32">
      <div className="mb-5 flex items-end justify-between border-b border-border pb-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-primary">Live RSS</p>
          <h2 className="mt-1 text-3xl font-black text-text">{category}</h2>
        </div>
        <span className="broadcast-hide rounded-md border border-blue-100 bg-white px-3 py-2 text-sm font-black text-slate-500">
          {articles.length}개 기사
        </span>
      </div>

      {articles.length ? (
        <div className="news-grid grid grid-cols-1 gap-5 xl:grid-cols-2">
          {articles.map((article, index) => (
            <NewsCard key={article.id} article={article} priority={index < 2} controls={controls} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-blue-200 bg-white px-6 py-10 text-center text-lg font-bold text-slate-500">
          현재 표시할 수 있는 안전한 RSS 기사가 없습니다.
        </div>
      )}
    </section>
  );
}
