"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { ClipboardList, MonitorPlay, Newspaper, Pin, Presentation, ShieldCheck, SlidersHorizontal } from "lucide-react";
import ChatTopics from "@/components/ChatTopics";
import NewsCard from "@/components/NewsCard";
import Section from "@/components/Section";
import Sidebar from "@/components/Sidebar";
import WeatherCard from "@/components/WeatherCard";
import { Button } from "@/components/ui/button";
import type { NewsArticle, NewsCategory } from "@/lib/rss";
import type { WeatherCity } from "@/lib/weather";
import { cn } from "@/lib/utils";
import { selectMainNews } from "@/lib/newsroom";

type WorkspaceMode = "dashboard" | "briefing" | "preparation" | "newsroom";
type PriorityLevel = 0 | 1 | 2 | 3;

type BroadcastState = {
  mainArticleId: string | null;
  pinnedArticleIds: string[];
  hiddenArticleIds: string[];
  orderedArticleIds: string[];
  priorities: Record<string, PriorityLevel>;
  regenerated: Record<string, { aiSummary?: string; talkingPoint?: string }>;
};

const storageKey = "choi-aeri-newsroom-workspace-v3";

const defaultBroadcastState: BroadcastState = {
  mainArticleId: null,
  pinnedArticleIds: [],
  hiddenArticleIds: [],
  orderedArticleIds: [],
  priorities: {},
  regenerated: {},
};

const modes: Array<{
  id: WorkspaceMode;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: "dashboard", label: "뉴스 선택", icon: Newspaper },
  { id: "briefing", label: "브리핑 페이지", icon: Presentation },
  { id: "preparation", label: "준비 페이지", icon: ClipboardList },
  { id: "newsroom", label: "📰 뉴스룸 모드", icon: MonitorPlay },
];

export default function BroadcastWorkspace({
  grouped,
  categories,
  chatTopics,
  total,
  weather,
}: {
  grouped: Record<NewsCategory, NewsArticle[]>;
  categories: NewsCategory[];
  chatTopics: string[];
  total: number;
  weather: { cities: WeatherCity[]; error: string | null };
}) {
  const [mode, setMode] = useState<WorkspaceMode>("dashboard");
  const [state, setState] = useState<BroadcastState>(defaultBroadcastState);
  const allArticles = useMemo(() => {
    return Object.values(grouped)
      .flat()
      .filter((article) => !state.hiddenArticleIds.includes(article.id))
      .map((article) => ({
        ...article,
        aiSummary: state.regenerated[article.id]?.aiSummary || article.aiSummary,
        talkingPoint: state.regenerated[article.id]?.talkingPoint || article.talkingPoint,
      }));
  }, [grouped, state.hiddenArticleIds, state.regenerated]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        setState({ ...defaultBroadcastState, ...(JSON.parse(saved) as Partial<BroadcastState>) });
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  const mainArticle = useMemo(() => {
    return (
      allArticles.find((article) => article.id === state.mainArticleId) ||
      selectMainNews(sortForBroadcast(allArticles, state)) ||
      null
    );
  }, [allArticles, state]);

  const pinnedArticles = useMemo(
    () => sortForBroadcast(allArticles, state).filter((article) => state.pinnedArticleIds.includes(article.id)),
    [allArticles, state],
  );
  const runOrder = useMemo(() => sortForBroadcast(allArticles, state).slice(0, 10), [allArticles, state]);

  function setMainArticle(id: string) {
    setState((current) => ({ ...current, mainArticleId: id }));
  }

  function togglePinned(id: string) {
    setState((current) => {
      const pinned = current.pinnedArticleIds.includes(id)
        ? current.pinnedArticleIds.filter((articleId) => articleId !== id)
        : [...current.pinnedArticleIds, id];
      return { ...current, pinnedArticleIds: pinned };
    });
  }

  function setPriority(id: string, priority: PriorityLevel) {
    setState((current) => ({
      ...current,
      priorities: {
        ...current.priorities,
        [id]: priority,
      },
    }));
  }

  function hideArticle(id: string) {
    setState((current) => ({
      ...current,
      hiddenArticleIds: [...new Set([...current.hiddenArticleIds, id])],
      pinnedArticleIds: current.pinnedArticleIds.filter((articleId) => articleId !== id),
      mainArticleId: current.mainArticleId === id ? null : current.mainArticleId,
    }));
  }

  function moveArticle(id: string, direction: "up" | "down") {
    const currentOrder = runOrder.map((article) => article.id);
    const index = currentOrder.indexOf(id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= currentOrder.length) return;
    const next = [...currentOrder];
    [next[index], next[target]] = [next[target], next[index]];
    setState((current) => ({ ...current, orderedArticleIds: next }));
  }

  function regenerateSummary(id: string) {
    const article = allArticles.find((item) => item.id === id);
    if (!article) return;
    setState((current) => ({
      ...current,
      regenerated: {
        ...current.regenerated,
        [id]: {
          ...current.regenerated[id],
          aiSummary: `${article.summary} 방송에서는 핵심만 짚고 원문으로 자세한 내용을 확인하면 좋습니다.`,
        },
      },
    }));
  }

  function regenerateTalkingPoint(id: string) {
    const article = allArticles.find((item) => item.id === id);
    if (!article) return;
    const point =
      article.category === "신제품 · 신메뉴"
        ? "채팅창 여러분은 이 신제품을 직접 먹어보고 싶으신가요?"
        : article.category === "게임"
          ? "가장 기대되는 기능은 무엇인가요?"
          : "채팅창 여러분은 어떻게 생각하시나요?";
    setState((current) => ({
      ...current,
      regenerated: {
        ...current.regenerated,
        [id]: {
          ...current.regenerated[id],
          talkingPoint: point,
        },
      },
    }));
  }

  const controls = {
    mainArticleId: mainArticle?.id || null,
    pinnedArticleIds: state.pinnedArticleIds,
    priorities: state.priorities,
    onSetMainArticle: setMainArticle,
    onTogglePinned: togglePinned,
    onSetPriority: setPriority,
    onHideArticle: hideArticle,
    onMoveArticle: moveArticle,
    onRegenerateSummary: regenerateSummary,
    onRegenerateTalkingPoint: regenerateTalkingPoint,
  };

  return (
    <main className={cn("dashboard-shell mx-auto flex max-w-[1760px] gap-8 px-8 py-8", mode === "newsroom" && "newsroom-mode")}>
      <Sidebar categories={categories} />
      <div className="min-w-0 flex-1 space-y-9">
        <section className="rounded-md border border-border bg-white px-8 py-7 shadow-newsroom">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="flex items-center gap-2 text-base font-black text-primary">
                <Newspaper className="h-5 w-5" />
                방송 진행 워크스페이스
              </p>
              <h2 className="mt-2 text-4xl font-black leading-tight text-text">최애리 뉴스룸</h2>
              <p className="mt-3 max-w-4xl text-xl font-semibold leading-relaxed text-slate-600">
                오늘의 메인 뉴스를 고르고, 고정 기사와 우선순위를 정한 뒤 브리핑 화면으로 바로 전환합니다.
              </p>
            </div>
            <div className="broadcast-hide flex items-center gap-3 rounded-md border border-blue-100 bg-blue-50 px-5 py-4">
              <ShieldCheck className="h-7 w-7 text-accent" />
              <div>
                <p className="text-sm font-black text-accent">방송 큐 준비</p>
                <p className="text-2xl font-black text-text">{total}개 기사</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-5">
            {modes.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  type="button"
                  variant={mode === item.id ? "default" : "outline"}
                  size="lg"
                  className="gap-2"
                  onClick={() => setMode(item.id)}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </section>

        {mode === "dashboard" ? (
          <>
            <MainNewsSelection mainArticle={mainArticle} pinnedArticles={pinnedArticles} runOrder={runOrder} />
            <WeatherCard cities={weather.cities} error={weather.error} />
            {categories.map((category) => (
              <Section key={category} category={category} articles={grouped[category]} controls={controls} />
            ))}
            <ChatTopics topics={chatTopics} />
          </>
        ) : null}

        {mode === "briefing" ? (
          <BriefingPage mainArticle={mainArticle} pinnedArticles={pinnedArticles} runOrder={runOrder} controls={controls} />
        ) : null}

        {mode === "preparation" ? (
          <PreparationPage articles={allArticles} pinnedArticles={pinnedArticles} runOrder={runOrder} state={state} chatTopics={chatTopics} />
        ) : null}

        {mode === "newsroom" ? (
          <NewsroomMode mainArticle={mainArticle} pinnedArticles={pinnedArticles} runOrder={runOrder} />
        ) : null}
      </div>
    </main>
  );
}

function MainNewsSelection({
  mainArticle,
  pinnedArticles,
  runOrder,
}: {
  mainArticle: NewsArticle | null;
  pinnedArticles: NewsArticle[];
  runOrder: NewsArticle[];
}) {
  return (
    <section className="rounded-md border border-blue-200 bg-white p-7 shadow-newsroom">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-primary">
            <SlidersHorizontal className="h-4 w-4" />
            오늘의 메인 뉴스
          </p>
          <h2 className="mt-1 text-3xl font-black text-text">🔥 오늘의 메인 뉴스</h2>
        </div>
        <div className="broadcast-hide rounded-md border border-border bg-blue-50 px-4 py-3 text-sm font-black text-accent">
          고정 {pinnedArticles.length}개 · 큐 {runOrder.length}개
        </div>
      </div>
      {mainArticle ? (
        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-md border border-border bg-blue-50/60 p-5">
            <p className="mb-2 text-sm font-black text-accent">오늘의 메인</p>
            <h3 className="text-3xl font-black leading-tight text-text">{mainArticle.title}</h3>
            <p className="mt-3 text-lg font-semibold leading-relaxed text-slate-600">{mainArticle.aiSummary}</p>
            <a className="mt-4 inline-flex rounded-md bg-accent px-5 py-3 text-base font-black text-white" href={mainArticle.url} target="_blank" rel="noopener noreferrer">
              🔗 원문 보기
            </a>
          </div>
          <RunOrderList articles={runOrder.slice(0, 5)} title="방송 진행 순서" />
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-blue-200 bg-blue-50/50 p-8 text-center text-lg font-bold text-slate-500">
          표시할 RSS 기사가 없습니다.
        </div>
      )}
    </section>
  );
}

function BriefingPage({
  mainArticle,
  pinnedArticles,
  runOrder,
  controls,
}: {
  mainArticle: NewsArticle | null;
  pinnedArticles: NewsArticle[];
  runOrder: NewsArticle[];
  controls: NewsCardControls;
}) {
  return (
    <section className="space-y-6">
      <div className="rounded-md border border-blue-200 bg-white p-7 shadow-newsroom">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-primary">Briefing</p>
        <h2 className="mt-1 text-4xl font-black text-text">브리핑 페이지</h2>
        <p className="mt-3 text-xl font-semibold text-slate-600">방송 시작 전 읽을 핵심 기사와 멘트 포인트를 한 화면에 모았습니다.</p>
      </div>
      {mainArticle ? (
        <NewsCard article={mainArticle} priority controls={controls} />
      ) : null}
      <div className="grid gap-5 xl:grid-cols-2">
        <RunOrderList articles={runOrder} title="오늘의 진행 큐" />
        <RunOrderList articles={pinnedArticles} title="고정 기사" emptyText="아직 고정한 기사가 없습니다." />
      </div>
    </section>
  );
}

function PreparationPage({
  articles,
  pinnedArticles,
  runOrder,
  state,
  chatTopics,
}: {
  articles: NewsArticle[];
  pinnedArticles: NewsArticle[];
  runOrder: NewsArticle[];
  state: BroadcastState;
  chatTopics: string[];
}) {
  const highPriorityCount = Object.values(state.priorities).filter((priority) => priority === 3).length;

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-blue-200 bg-white p-7 shadow-newsroom">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-primary">Preparation</p>
        <h2 className="mt-1 text-4xl font-black text-text">준비 페이지</h2>
        <div className="mt-6 grid gap-4 xl:grid-cols-4">
          <PrepStat label="전체 기사" value={`${articles.length}개`} />
          <PrepStat label="고정 기사" value={`${pinnedArticles.length}개`} />
          <PrepStat label="최우선 기사" value={`${highPriorityCount}개`} />
          <PrepStat label="진행 큐" value={`${runOrder.length}개`} />
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <RunOrderList articles={runOrder.filter((article) => article.category === "게임").slice(0, 3)} title="Top Game News" />
        <RunOrderList articles={runOrder.filter((article) => article.category === "IT").slice(0, 3)} title="Top IT News" />
        <RunOrderList articles={runOrder.filter((article) => article.category === "신제품 · 신메뉴").slice(0, 3)} title="Top Product News" />
        <RunOrderList articles={runOrder.filter((article) => article.category === "애니 · 만화").slice(0, 3)} title="Top Anime News" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <RunOrderList articles={runOrder} title="방송 순서 점검" />
        <div className="rounded-md border border-border bg-white p-6 shadow-newsroom">
          <h3 className="text-2xl font-black text-text">준비 체크리스트</h3>
          <div className="mt-4 space-y-3 text-lg font-bold text-slate-600">
            <p>메인 뉴스가 선택되어 있나요?</p>
            <p>원문 링크를 방송 전에 한 번 열어봤나요?</p>
            <p>고정 기사와 우선순위가 방송 흐름에 맞나요?</p>
            <p>브리핑 페이지에서 읽을 순서를 확인했나요?</p>
          </div>
        </div>
      </div>
      <div className="rounded-md border border-border bg-white p-6 shadow-newsroom">
        <h3 className="text-2xl font-black text-text">Daily Topics</h3>
        <ol className="mt-4 space-y-3">
          {chatTopics.map((topic, index) => (
            <li key={topic} className="rounded-md border border-blue-100 bg-blue-50/60 p-4 text-lg font-black text-text">
              {index + 1}. {topic}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function NewsroomMode({
  mainArticle,
  pinnedArticles,
  runOrder,
}: {
  mainArticle: NewsArticle | null;
  pinnedArticles: NewsArticle[];
  runOrder: NewsArticle[];
}) {
  return (
    <section className="space-y-6">
      <div className="rounded-md border border-blue-200 bg-white p-8 shadow-newsroom">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">뉴스룸 모드</p>
        <h2 className="mt-1 text-5xl font-black text-text">📰 뉴스룸 모드</h2>
      </div>
      {mainArticle ? (
        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="overflow-hidden rounded-md border border-border bg-white shadow-newsroom">
            <img src={mainArticle.thumbnail} alt="" className="h-[420px] w-full object-cover" />
            <div className="p-8">
              <p className="text-xl font-black text-accent">{mainArticle.source} · {mainArticle.category}</p>
              <h3 className="mt-3 text-5xl font-black leading-tight text-text">{mainArticle.title}</h3>
              <p className="mt-5 text-2xl font-bold leading-relaxed text-slate-700">🤖 {mainArticle.aiSummary}</p>
              <p className="mt-4 rounded-md bg-blue-50 p-5 text-2xl font-black text-accent">🎤 {mainArticle.talkingPoint}</p>
            </div>
          </div>
          <RunOrderList articles={pinnedArticles.length ? pinnedArticles : runOrder.slice(1)} title="다음 뉴스" />
        </div>
      ) : null}
    </section>
  );
}

function RunOrderList({
  articles,
  title,
  emptyText = "표시할 기사가 없습니다.",
}: {
  articles: NewsArticle[];
  title: string;
  emptyText?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-white p-6 shadow-newsroom">
      <h3 className="mb-4 flex items-center gap-2 text-2xl font-black text-text">
        <Pin className="h-5 w-5 text-primary" />
        {title}
      </h3>
      {articles.length ? (
        <ol className="space-y-3">
          {articles.map((article, index) => (
            <li key={article.id} className="rounded-md border border-blue-100 bg-blue-50/60 p-4">
              <p className="text-sm font-black text-accent">{index + 1}. {article.source} · {article.category}</p>
              <p className="mt-1 line-clamp-2 text-lg font-black leading-snug text-text">{article.title}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-md border border-dashed border-blue-200 p-6 text-center text-lg font-bold text-slate-500">{emptyText}</p>
      )}
    </div>
  );
}

function PrepStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-blue-100 bg-blue-50/70 p-5">
      <p className="text-sm font-black text-accent">{label}</p>
      <p className="mt-2 text-3xl font-black text-text">{value}</p>
    </div>
  );
}

function sortForBroadcast(articles: NewsArticle[], state: BroadcastState) {
  return [...articles].sort((a, b) => {
    const aOrder = state.orderedArticleIds.indexOf(a.id);
    const bOrder = state.orderedArticleIds.indexOf(b.id);
    if (aOrder >= 0 || bOrder >= 0) return (aOrder >= 0 ? aOrder : 999) - (bOrder >= 0 ? bOrder : 999);

    const pinnedScore = Number(state.pinnedArticleIds.includes(b.id)) - Number(state.pinnedArticleIds.includes(a.id));
    if (pinnedScore) return pinnedScore;

    const priorityScore = (state.priorities[b.id] || 0) - (state.priorities[a.id] || 0);
    if (priorityScore) return priorityScore;

    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export type NewsCardControls = {
  mainArticleId: string | null;
  pinnedArticleIds: string[];
  priorities: Record<string, PriorityLevel>;
  onSetMainArticle: (id: string) => void;
  onTogglePinned: (id: string) => void;
  onSetPriority: (id: string, priority: PriorityLevel) => void;
  onHideArticle: (id: string) => void;
  onMoveArticle: (id: string, direction: "up" | "down") => void;
  onRegenerateSummary: (id: string) => void;
  onRegenerateTalkingPoint: (id: string) => void;
};
