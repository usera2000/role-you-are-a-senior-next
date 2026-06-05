import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NewsArticle } from "@/lib/rss";

export default function ArticleListPanel({
  title,
  articles,
  emptyText = "표시할 기사가 없습니다.",
}: {
  title: string;
  articles: NewsArticle[];
  emptyText?: string;
}) {
  return (
    <section className="rounded-md border border-border bg-white p-6 shadow-newsroom">
      <h2 className="text-2xl font-black text-text">{title}</h2>
      {articles.length ? (
        <div className="mt-4 space-y-4">
          {articles.map((article) => (
            <article key={article.id} className="rounded-md border border-blue-100 bg-blue-50/60 p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm font-black text-accent">
                <span>[{article.priorityTag}]</span>
                <span>{article.source}</span>
                <span>{article.category}</span>
              </div>
              <h3 className="mt-2 line-clamp-2 text-xl font-black leading-snug text-text">{article.title}</h3>
              <p className="mt-2 line-clamp-2 text-base font-semibold text-slate-600">{article.aiSummary}</p>
              <Button asChild size="sm" className="mt-3 gap-2">
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  🔗 원문 보기
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-md border border-dashed border-blue-200 p-6 text-center text-lg font-bold text-slate-500">
          {emptyText}
        </p>
      )}
    </section>
  );
}
