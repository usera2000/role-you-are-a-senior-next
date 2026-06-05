import { MessageCircleQuestion } from "lucide-react";

export default function ChatTopics({ topics }: { topics: string[] }) {
  return (
    <section id="chat-topics" className="rounded-md border border-blue-200 bg-white p-7 shadow-newsroom">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50">
          <MessageCircleQuestion className="h-7 w-7 text-accent" />
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-primary">오늘의 대화</p>
          <h2 className="text-3xl font-black text-text">오늘의 채팅 주제</h2>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {topics.map((topic, index) => (
          <div key={topic} className="rounded-md border border-border bg-blue-50/60 p-5">
            <p className="mb-2 text-sm font-black text-accent">주제 {index + 1}</p>
            <p className="text-xl font-black leading-snug text-text">{topic}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
