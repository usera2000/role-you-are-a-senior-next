import { CloudSun, Flame, Gift, Gamepad2, Laptop, MessageCircle, Smile, Sparkles, Tags, Tv } from "lucide-react";
import type { NewsCategory } from "@/lib/rss";

const icons: Record<NewsCategory, React.ComponentType<{ className?: string }>> = {
  "전국 날씨": CloudSun,
  "핫이슈": Flame,
  "신제품 · 신메뉴": Gift,
  "게임": Gamepad2,
  "할인 · 특가": Tags,
  "애니 · 만화": Tv,
  IT: Laptop,
  "커뮤니티 화제글": MessageCircle,
  "유머": Smile,
  "오늘의 채팅 주제": Sparkles,
};

export default function Sidebar({ categories }: { categories: NewsCategory[] }) {
  return (
    <aside className="broadcast-hide sticky top-28 h-[calc(100vh-8rem)] w-72 shrink-0 rounded-md border border-border bg-white p-5 shadow-newsroom">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">News Board</p>
        <h2 className="mt-1 text-2xl font-black text-text">오늘의 순서</h2>
      </div>
      <nav className="space-y-2">
        {categories.map((category) => {
          const Icon = icons[category];
          return (
            <a
              key={category}
              href={`#${category}`}
              className="flex items-center gap-3 rounded-md border border-transparent px-4 py-3 text-lg font-extrabold text-slate-600 transition hover:border-blue-100 hover:bg-blue-50 hover:text-accent"
            >
              <Icon className="h-5 w-5 text-primary" />
              {category}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
