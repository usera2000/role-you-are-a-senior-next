import { CalendarDays, Sparkles } from "lucide-react";
import BroadcastModeToggle from "@/components/BroadcastModeToggle";

export default function Header() {
  const today = new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "full",
    timeZone: "Asia/Seoul",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1760px] items-center justify-between gap-6 px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-md border border-blue-200 bg-white shadow-newsroom">
            <Sparkles className="h-7 w-7 text-accent" />
          </div>
          <div>
            <p className="broadcast-hide text-sm font-bold text-primary">한국 아침 방송 뉴스룸</p>
            <h1 className="text-4xl font-black tracking-normal text-text">최애리 뉴스룸</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="broadcast-hide flex items-center gap-2 rounded-md border border-border bg-white px-4 py-3 text-base font-bold text-slate-600">
            <CalendarDays className="h-5 w-5 text-primary" />
            {today}
          </div>
          <BroadcastModeToggle />
        </div>
      </div>
    </header>
  );
}
