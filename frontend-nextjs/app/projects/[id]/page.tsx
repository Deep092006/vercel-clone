// → app/projects/[id]/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Github, ExternalLink, ChevronRight, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Fira_Code } from "next/font/google";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/app/status-pill";
import {
  deriveStatusFromLogLine,
  isTerminalStatus,
  statusLabel,
} from "@/lib/deployments";

const firaCode = Fira_Code({ subsets: ["latin"] });

type Deployment = {
  _id: string;
  repoUrl: string;
  repoFullName?: string | null;
  projectSlug?: string;
  previewUrl?: string;
  status?: string;
  latestLog?: string;
  createdAt?: string;
  updatedAt?: string;
};

const PIPELINE = [
  { key: "queued",    label: "Queued" },
  { key: "building", label: "Building" },
  { key: "uploading",label: "Uploading" },
  { key: "ready",    label: "Ready" },
];

/** Returns true if this step is "done" given the active status */
function isStepDone(stepKey: string, activeStatus: string) {
  const order = ["queued", "building", "uploading", "ready"];
  const stepIdx = order.indexOf(stepKey);
  const activeIdx = order.indexOf(activeStatus);
  return stepIdx <= activeIdx;
}

export default function ProjectDetailPage() {
  // ── unchanged state & logic ──────────────────────────────────────────────
  const params = useParams<{ id: string }>();
  const deploymentId = params?.id;

  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const logsEndRef = useRef<HTMLElement>(null);

  const loadDeployment = useCallback(async () => {
    if (!deploymentId) return;
    const response = await fetch(`/api/deployments/${deploymentId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || "Failed to load deployment");
    setDeployment(data);
  }, [deploymentId]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try { await loadDeployment(); }
      catch (err) { if (active) setError(err instanceof Error ? err.message : "Unknown error"); }
      finally { if (active) setLoading(false); }
    };
    init();
    return () => { active = false; };
  }, [loadDeployment]);

  useEffect(() => {
    if (!deploymentId) return;
    const interval = setInterval(() => {
      loadDeployment().catch(() => undefined);
    }, 5000);
    return () => clearInterval(interval);
  }, [deploymentId, loadDeployment]);

  useEffect(() => {
    if (!deployment?.projectSlug) return;
    let canceled = false;

    const pollLogs = async () => {
      try {
        const response = await fetch(`/api/logs/${deployment.projectSlug}?since=${cursor}`);
        const data = await response.json();
        if (!response.ok || canceled) return;

        const newLogs = Array.isArray(data?.logs) ? data.logs : [];
        if (newLogs.length > 0) {
          setLogs((prev) => [...prev, ...newLogs]);
          setCursor(typeof data?.next === "number" ? data.next : cursor + newLogs.length);

          let nextStatus: string | undefined;
          for (const line of newLogs) {
            if (typeof line !== "string") continue;
            const status = deriveStatusFromLogLine(line);
            if (status) nextStatus = status;
          }
          if (nextStatus) {
            setDeployment((prev) => (prev ? { ...prev, status: nextStatus } : prev));
          }
        }
      } catch { return; }
    };

    pollLogs();
    const interval = setInterval(pollLogs, 2000);
    return () => { canceled = true; clearInterval(interval); };
  }, [cursor, deployment?.projectSlug]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const activeStatus = deployment?.status || "queued";
  const isActive = !isTerminalStatus(deployment?.status);
  // ────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
        :root { font-family: 'Geist', system-ui, sans-serif; }

        .dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .log-scroll::-webkit-scrollbar { width: 4px; }
        .log-scroll::-webkit-scrollbar-track { background: transparent; }
        .log-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .log-line { line-height: 1.7; }
        .log-line:hover { background: rgba(255,255,255,0.04); border-radius: 4px; }

        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        .cursor-blink { animation: blink 1.1s step-end infinite; }

        .info-card { transition: border-color .15s; }
        .info-card:hover { border-color: rgba(255,255,255,0.12); }
      `}</style>

      <main className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="dot-grid fixed inset-0 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6">

          {/* ── NAVBAR ───────────────────────────────────────────────────── */}
          <header className="flex items-center justify-between h-14 border-b border-white/[0.07]">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <Github className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="font-semibold text-sm tracking-tight">DeployKit</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#333] mx-0.5" />
              <span className="text-sm text-[#666] truncate max-w-[160px]">
                {deployment?.repoFullName || "Deployment"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                asChild variant="ghost" size="sm"
                className="h-8 px-3 text-xs text-[#888] hover:text-white hover:bg-white/[0.06] rounded-lg"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button
                asChild size="sm"
                className="h-8 px-3 text-xs bg-white text-black hover:bg-white/90 rounded-lg font-medium"
              >
                <Link href="/projects/new">New Project</Link>
              </Button>
            </div>
          </header>

          {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
          <div className="pt-10 pb-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {deployment?.repoFullName || "Loading…"}
                </h1>
                {deployment?.repoUrl && (
                  <a
                    href={deployment.repoUrl}
                    target="_blank"
                    className="text-sm text-[#555] hover:text-[#888] transition-colors mt-1 flex items-center gap-1.5 w-fit"
                  >
                    {deployment.repoUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              {deployment && <StatusPill status={deployment.status} />}
            </div>
          </div>

          {/* ── LOADING SKELETON ─────────────────────────────────────────── */}
          {loading && (
            <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
              {[400, 480].map((h) => (
                <div
                  key={h}
                  className="rounded-2xl animate-pulse"
                  style={{ height: h, background: 'rgba(255,255,255,0.04)' }}
                />
              ))}
            </div>
          )}

          {/* ── ERROR ────────────────────────────────────────────────────── */}
          {error && (
            <div
              className="rounded-xl px-5 py-4 text-sm text-red-300 mb-4"
              style={{ border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)' }}
            >
              {error}
            </div>
          )}

          {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
          {!loading && deployment && (
            <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr] pb-20">

              {/* LEFT – project info + pipeline */}
              <div className="space-y-4">

                {/* info cards row */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Project slug", value: deployment.projectSlug || "—" },
                    { label: "Status", value: statusLabel(activeStatus) },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="info-card rounded-xl p-4"
                      style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
                    >
                      <p className="text-[10px] uppercase tracking-widest text-[#444] font-medium mb-1.5">{label}</p>
                      <p className="text-sm font-semibold font-mono text-white truncate">{value}</p>
                    </div>
                  ))}
                </div>

                {/* preview URL */}
                {deployment.previewUrl && (
                  <div
                    className="info-card rounded-xl p-4"
                    style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
                  >
                    <p className="text-[10px] uppercase tracking-widest text-[#444] font-medium mb-1.5">Preview URL</p>
                    <a
                      href={deployment.previewUrl}
                      target="_blank"
                      className="text-sm text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1.5 font-mono"
                    >
                      {deployment.previewUrl}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                )}

                {/* pipeline stepper */}
                <div
                  className="rounded-2xl p-5"
                  style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)' }}
                >
                  <p className="text-[10px] uppercase tracking-widest text-[#444] font-medium mb-5">Deployment pipeline</p>

                  <div className="space-y-0">
                    {PIPELINE.map((step, i) => {
                      const done = isStepDone(step.key, activeStatus);
                      const current = step.key === activeStatus && isActive;

                      return (
                        <div key={step.key} className="flex items-start gap-4">
                          {/* connector column */}
                          <div className="flex flex-col items-center">
                            <div
                              className="relative w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                              style={{
                                background: done ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.04)',
                                border: done
                                  ? '1px solid rgba(52,211,153,0.4)'
                                  : '1px solid rgba(255,255,255,0.08)',
                              }}
                            >
                              {current ? (
                                <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                              ) : done ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Circle className="w-3 h-3 text-[#333]" />
                              )}
                            </div>
                            {i < PIPELINE.length - 1 && (
                              <div
                                className="w-px flex-1 min-h-[28px] transition-all duration-500"
                                style={{ background: done ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.07)' }}
                              />
                            )}
                          </div>

                          {/* label */}
                          <div className={`pt-1 pb-${i < PIPELINE.length - 1 ? 5 : 0}`} style={{ paddingBottom: i < PIPELINE.length - 1 ? 20 : 0 }}>
                            <p
                              className="text-sm font-medium transition-colors"
                              style={{ color: done ? '#fff' : '#444' }}
                            >
                              {step.label}
                            </p>
                            {current && (
                              <p className="text-xs text-emerald-400/70 mt-0.5">In progress…</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* timestamps */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Created", value: deployment.createdAt },
                    { label: "Updated", value: deployment.updatedAt || deployment.createdAt },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="info-card rounded-xl p-4"
                      style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
                    >
                      <p className="text-[10px] uppercase tracking-widest text-[#444] font-medium mb-1.5">{label}</p>
                      <p className="text-xs font-mono text-[#666] tabular-nums">
                        {value
                          ? new Date(value).toLocaleString(undefined, {
                              month: "short", day: "numeric",
                              hour: "2-digit", minute: "2-digit", second: "2-digit",
                            })
                          : "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT – terminal log viewer */}
              <div
                className="rounded-2xl overflow-hidden flex flex-col"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {/* terminal chrome */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center gap-2">
                    {/* traffic-light dots */}
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                    </div>
                    <span className="text-[11px] text-[#555] font-mono ml-2">
                      {deployment.projectSlug || "build"}.log
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-emerald-400/80 font-mono">LIVE</span>
                      </div>
                    )}
                    <span className="text-[10px] text-[#444] font-mono tabular-nums">
                      {logs.length} lines
                    </span>
                  </div>
                </div>

                {/* log body */}
                <div
                  className={`${firaCode.className} log-scroll overflow-y-auto flex-1`}
                  style={{ background: '#0a0a0a', minHeight: 400, maxHeight: 520 }}
                >
                  {logs.length === 0 ? (
                    <div className="flex items-center justify-center h-40">
                      <p className="text-sm text-[#333] font-mono">
                        {isTerminalStatus(deployment.status)
                          ? "No logs captured."
                          : "Waiting for build output…"}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-0">
                      {logs.map((log, i) => (
                        <div
                          key={`${i}-${log.slice(0, 12)}`}
                          className="log-line flex gap-3 px-1 text-[12.5px]"
                        >
                          <span
                            className="tabular-nums select-none flex-shrink-0 w-7 text-right"
                            style={{ color: '#333' }}
                          >
                            {i + 1}
                          </span>
                          <span className="flex-1 text-emerald-400 break-all">
                            {`> ${log}`}
                          </span>
                        </div>
                      ))}
                      {/* blinking cursor when active */}
                      {isActive && (
                        <div className="flex gap-3 px-1 text-[12.5px] mt-1">
                          <span className="w-7 flex-shrink-0" />
                          <span className="cursor-blink text-emerald-400">▋</span>
                        </div>
                      )}
                    </div>
                  )}
                  {/* scroll anchor */}
                  <code ref={logsEndRef} />
                </div>

                {/* log footer */}
                <div
                  className="px-4 py-2.5 flex items-center justify-between"
                  style={{ background: '#0d0d0d', borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="text-[10px] text-[#333] font-mono">
                    {deployment.projectSlug ? `slug: ${deployment.projectSlug}` : ""}
                  </span>
                  <StatusPill status={deployment.status} />
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </>
  );
}