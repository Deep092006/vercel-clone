"use client";

import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; color: string; bg: string; animate?: boolean; glow?: boolean }> = {
  queued:    { label: "Queued",    color: "text-amber-400",   bg: "bg-amber-400/10" },
  building:  { label: "Building",  color: "text-sky-400",     bg: "bg-sky-400/10", animate: true },
  uploading: { label: "Uploading", color: "text-violet-400",  bg: "bg-violet-400/10", animate: true },
  ready:     { label: "Ready",     color: "text-emerald-400", bg: "bg-emerald-400/10", glow: true },
  failed:    { label: "Failed",    color: "text-red-400",     bg: "bg-red-400/10" },
  error:     { label: "Error",     color: "text-red-400",     bg: "bg-red-400/10" },
};

export function StatusPill({ status }: { status?: string }) {
  const cfg = statusConfig[status || ""] || { label: status || "Unknown", color: "text-[#888]", bg: "bg-white/5" };

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all",
      cfg.bg, cfg.color,
      cfg.glow && "shadow-[0_0_12px_rgba(52,211,153,0.15)]"
    )}>
      <span className={cn(
        "w-2 h-2 rounded-full",
        status === "ready" ? "bg-emerald-400" :
        status === "failed" || status === "error" ? "bg-red-400" :
        status === "building" || status === "uploading" ? "bg-sky-400" :
        "bg-amber-400",
        cfg.animate && "animate-pulse"
      )} />
      {cfg.label}
    </div>
  );
}
