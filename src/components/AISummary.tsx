import { Bot } from "lucide-react";

export default function AISummary({ children }: { children: string }) {
  return (
    <div className="rounded-md border border-blue-100 bg-blue-50/70 p-4">
      <p className="mb-2 flex items-center gap-2 text-sm font-black text-accent">
        <Bot className="h-4 w-4" />
        🤖 AI 요약
      </p>
      <p className="line-clamp-3 text-base font-semibold leading-relaxed text-slate-700">{children}</p>
    </div>
  );
}
