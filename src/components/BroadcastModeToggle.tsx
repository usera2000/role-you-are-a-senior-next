"use client";

import { useEffect, useState } from "react";
import { MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const storageKey = "choi-aeri-newsroom-broadcast-mode";

export default function BroadcastModeToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey) === "true";
    setEnabled(saved);
    document.documentElement.classList.toggle("broadcast-mode", saved);
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    window.localStorage.setItem(storageKey, String(next));
    document.documentElement.classList.toggle("broadcast-mode", next);
  }

  return (
    <Button
      type="button"
      size="lg"
      onClick={toggle}
      className={cn(
        "gap-2 border-2 shadow-newsroom",
        enabled ? "border-accent bg-accent text-white" : "border-blue-200 bg-white text-accent hover:bg-blue-50",
      )}
      aria-pressed={enabled}
    >
      <MonitorPlay className="h-5 w-5" />
      🎥 방송 모드
    </Button>
  );
}
