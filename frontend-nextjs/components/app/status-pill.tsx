import { statusLabel } from "@/lib/deployments";
import { cn } from "@/lib/utils";

const statusClassMap: Record<string, string> = {
  queued: "border-slate-700 text-slate-300",
  building: "border-blue-700 text-blue-300",
  uploading: "border-amber-700 text-amber-300",
  ready: "border-emerald-700 text-emerald-300",
  failed: "border-rose-700 text-rose-300",
};

export function StatusPill({ status }: { status?: string }) {
  const key = status || "queued";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        statusClassMap[key] || statusClassMap.queued
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
