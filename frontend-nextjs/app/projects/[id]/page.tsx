"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Github } from "lucide-react";
import { Fira_Code } from "next/font/google";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/app/status-pill";
import { deriveStatusFromLogLine, isTerminalStatus, statusLabel } from "@/lib/deployments";

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

export default function ProjectDetailPage() {
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
    if (!response.ok) {
      throw new Error(data?.error || "Failed to load deployment");
    }
    setDeployment(data);
  }, [deploymentId]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        await loadDeployment();
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    init();
    return () => {
      active = false;
    };
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
        const response = await fetch(
          `/api/logs/${deployment.projectSlug}?since=${cursor}`
        );
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
      } catch {
        return;
      }
    };

    pollLogs();
    const interval = setInterval(pollLogs, 2000);
    return () => {
      canceled = true;
      clearInterval(interval);
    };
  }, [cursor, deployment?.projectSlug]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const timeline = useMemo(
    () => [
      { key: "queued", label: "Queued" },
      { key: "building", label: "Building" },
      { key: "uploading", label: "Uploading" },
      { key: "ready", label: "Ready" },
    ],
    []
  );

  const activeStatus = deployment?.status || "queued";

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="text-2xl" />
            <span className="text-lg font-semibold">Deployment</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/projects/new">New repo</Link>
            </Button>
          </div>
        </header>

        {loading && <p className="text-sm text-slate-400">Loading deployment…</p>}
        {error && (
          <div className="rounded-lg border border-rose-700/60 bg-rose-950/20 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {!loading && deployment && (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Repository</p>
                  <p className="text-lg font-semibold">
                    {deployment.repoFullName || deployment.repoUrl}
                  </p>
                  <a
                    href={deployment.repoUrl}
                    target="_blank"
                    className="text-sm text-sky-400 hover:underline"
                  >
                    {deployment.repoUrl}
                  </a>
                </div>
                <StatusPill status={deployment.status} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                  <p className="text-xs text-slate-400">Project slug</p>
                  <p className="text-sm font-medium">
                    {deployment.projectSlug || "-"}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                  <p className="text-xs text-slate-400">Current status</p>
                  <p className="text-sm font-medium">{statusLabel(activeStatus)}</p>
                </div>
              </div>

              {deployment.previewUrl && (
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                  <p className="text-xs text-slate-400">Preview URL</p>
                  <a
                    href={deployment.previewUrl}
                    target="_blank"
                    className="text-sm text-sky-400 hover:underline"
                  >
                    {deployment.previewUrl}
                  </a>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">Pipeline</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {timeline.map((step) => {
                    const stepDone =
                      step.key === activeStatus ||
                      (step.key === "queued" && activeStatus !== "queued") ||
                      (step.key === "building" &&
                        ["uploading", "ready"].includes(activeStatus)) ||
                      (step.key === "uploading" && activeStatus === "ready");
                    return (
                      <div
                        key={step.key}
                        className={`rounded-md border px-3 py-2 text-xs ${
                          stepDone
                            ? "border-sky-700 bg-sky-950/30 text-sky-300"
                            : "border-slate-800 text-slate-400"
                        }`}
                      >
                        {step.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Build logs</h2>
                <StatusPill status={deployment.status} />
              </div>
              <div
                className={`${firaCode.className} h-[420px] overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm text-green-400`}
              >
                {logs.length === 0 ? (
                  <p className="text-slate-400">
                    {isTerminalStatus(deployment.status)
                      ? "No logs captured for this deployment."
                      : "Waiting for logs…"}
                  </p>
                ) : (
                  <pre className="flex flex-col gap-1 whitespace-pre-wrap">
                    {logs.map((log, index) => (
                      <code key={`${index}-${log}`}>{`> ${log}`}</code>
                    ))}
                    <code ref={logsEndRef} />
                  </pre>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
