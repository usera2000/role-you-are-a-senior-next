import { Mic2 } from "lucide-react";

export default function TalkingPoint({ children }: { children: string }) {
  return (
    <div className="rounded-md border border-sky-100 bg-white p-4">
      <p className="mb-2 flex items-center gap-2 text-sm font-black text-primary">
        <Mic2 className="h-4 w-4" />
        🎤 방송 포인트
      </p>
      <p className="text-base font-bold leading-relaxed text-text">{children}</p>
    </div>
  );
}
