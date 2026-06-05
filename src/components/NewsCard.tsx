"use client";

import { ArrowDown, ArrowUp, ExternalLink, EyeOff, Pin, RotateCw, Star } from "lucide-react";
import AISummary from "@/components/AISummary";
import TalkingPoint from "@/components/TalkingPoint";
import { Button } from "@/components/ui/button";
import type { NewsCardControls } from "@/components/BroadcastWorkspace";
import type { NewsArticle } from "@/lib/rss";
import { cn } from "@/lib/utils";

export default function NewsCard({
  article,
  priority = false,
  controls,
}: {
  article: NewsArticle;
  priority?: boolean;
  controls?: NewsCardControls;
}) {
  const date = new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(new Date(article.publishedAt));
  const isPinned = controls?.pinnedArticleIds.includes(article.id) || false;
  const isMain = controls?.mainArticleId === article.id;
  const priorityLevel = controls?.priorities[article.id] || 0;

  return (
    <article
      className={cn(
        "news-card group flex min-h-[410px] overflow-hidden rounded-md border border-border bg-card shadow-newsroom transition duration-200 hover:-translate-y-1 hover:border-blue-200",
        isMain && "border-accent ring-2 ring-blue-200",
        isPinned && "bg-blue-50/40",
      )}
    >
      <div className="relative w-[34%] min-w-[250px] overflow-hidden bg-blue-100">
        <img
          src={article.thumbnail}
          alt=""
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 rounded-md bg-white/92 px-3 py-1 text-sm font-black text-accent shadow">
          {article.category}
        </div>
        {isMain ? (
          <div className="absolute bottom-4 left-4 rounded-md bg-accent px-3 py-1 text-sm font-black text-white shadow">
            메인 뉴스
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-4 p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
            <span className="rounded-md bg-accent px-2.5 py-1 text-white">[{article.priorityTag}]</span>
            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-accent">{article.source}</span>
            <span>{date}</span>
            {priorityLevel ? (
              <span className="rounded-md bg-accent px-2.5 py-1 text-white">우선순위 {priorityLevel}</span>
            ) : null}
            {isPinned ? <span className="rounded-md bg-white px-2.5 py-1 text-accent">고정됨</span> : null}
          </div>
          <h3 className="line-clamp-2 text-2xl font-black leading-tight text-text">{article.title}</h3>
          <AISummary>{article.aiSummary}</AISummary>
          <TalkingPoint>{article.talkingPoint}</TalkingPoint>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {controls ? (
            <>
              <Button
                type="button"
                size="sm"
                variant={isMain ? "default" : "outline"}
                className="gap-2"
                onClick={() => controls.onSetMainArticle(article.id)}
              >
                <Star className="h-4 w-4" />
                메인 선택
              </Button>
              <Button
                type="button"
                size="sm"
                variant={isPinned ? "default" : "outline"}
                className="gap-2"
                onClick={() => controls.onTogglePinned(article.id)}
              >
                <Pin className="h-4 w-4" />
                {isPinned ? "고정 해제" : "고정"}
              </Button>
              <div className="flex items-center gap-1 rounded-md border border-border bg-white p-1">
                {[1, 2, 3].map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={cn(
                      "h-8 w-8 rounded-md text-sm font-black transition",
                      priorityLevel === level ? "bg-accent text-white" : "text-slate-500 hover:bg-blue-50",
                    )}
                    onClick={() => controls.onSetPriority(article.id, priorityLevel === level ? 0 : (level as 1 | 2 | 3))}
                    aria-label={`우선순위 ${level}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <Button type="button" size="sm" variant="outline" className="gap-2" onClick={() => controls.onMoveArticle(article.id, "up")}>
                <ArrowUp className="h-4 w-4" />
                위로
              </Button>
              <Button type="button" size="sm" variant="outline" className="gap-2" onClick={() => controls.onMoveArticle(article.id, "down")}>
                <ArrowDown className="h-4 w-4" />
                아래로
              </Button>
              <Button type="button" size="sm" variant="outline" className="gap-2" onClick={() => controls.onRegenerateSummary(article.id)}>
                <RotateCw className="h-4 w-4" />
                요약 재생성
              </Button>
              <Button type="button" size="sm" variant="outline" className="gap-2" onClick={() => controls.onRegenerateTalkingPoint(article.id)}>
                <RotateCw className="h-4 w-4" />
                포인트 재생성
              </Button>
              <Button type="button" size="sm" variant="ghost" className="gap-2 text-slate-500" onClick={() => controls.onHideArticle(article.id)}>
                <EyeOff className="h-4 w-4" />
                숨김
              </Button>
            </>
          ) : null}
          <Button asChild size="lg" className="gap-2">
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              🔗 원문 보기
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
