// → app/(app)/dashboard/page.tsx
"use client";

import { Navbar } from "@/components/app/navbar";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Github, Plus, Search, ExternalLink, Zap, CheckCircle2, Clock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/app/status-pill";

type UserProfile = {
  login: string;
  name?: string | null;
  avatar_url: string;
};

type Deployment = {
  _id: string;
  repoUrl: string;
  repoFullName?: string | null;
  projectSlug?: string;
  previewUrl?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  latestLog?: string;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [search, setSearch] = useState("");
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const status = await fetch("/api/auth/status").then((res) => res.json());
        const isAuthed = Boolean(status?.authenticated);
        setAuthenticated(isAuthed);
        if (!isAuthed) { setLoading(false); return; }

        const [userRes, deploymentsRes] = await Promise.all([
          fetch("/api/github/user"),
          fetch("/api/deployments"),
        ]);
        if (!userRes.ok || !deploymentsRes.ok) throw new Error("Failed to load dashboard data");

        setProfile(await userRes.json());
        const d = await deploymentsRes.json();
        setDeployments(Array.isArray(d) ? d : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredDeployments = useMemo(() => {
    const value = search.toLowerCase().trim();
    if (!value) return deployments;
    return deployments.filter((d) =>
      `${d.repoFullName || d.repoUrl} ${d.projectSlug || ""}`.toLowerCase().includes(value)
    );
  }, [deployments, search]);

  const stats = useMemo(() => {
    const total = deployments.length;
    const ready = deployments.filter(d => d.status === "ready").length;
    const failed = deployments.filter(d => d.status === "failed" || d.status === "error").length;
    const rate = total > 0 ? Math.round((ready / total) * 100) : 0;
    return { total, ready, failed, rate };
  }, [deployments]);

  return (
    <>
      <Navbar breadcrumbs={[{ label: "Dashboard" }]} />
      <main className="max-w-6xl mx-auto px-6">

          {/* ── PAGE TITLE ───────────────────────────────────────────────── */}
          <div className="pt-10 pb-8 flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
              {profile && (
                <p className="text-[15px] text-[#666] mt-1">
                  {profile.name || profile.login}&apos;s deployments
                </p>
              )}
            </div>
          </div>

          {/* ── QUICK STATS ROW ────────────────────────────────────────── */}
          {authenticated && !loading && deployments.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Projects", value: stats.total, icon: Layers, color: "text-white" },
                { label: "Successful", value: stats.ready, icon: CheckCircle2, color: "text-emerald-400" },
                { label: "Failed", value: stats.failed, icon: Zap, color: "text-red-400" },
                { label: "Success Rate", value: `${stats.rate}%`, icon: Clock, color: "text-sky-400" },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-5 group relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-[#888] font-medium">{stat.label}</p>
                    <stat.icon className={`w-4 h-4 text-[#555] group-hover:${stat.color} transition-colors`} />
                  </div>
                  <p className="stat-value">{stat.value}</p>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/[0.015] rounded-full blur-xl group-hover:bg-white/[0.03] transition-colors" />
                </div>
              ))}
            </div>
          )}

          {/* ── LOADING ──────────────────────────────────────────────────── */}
          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-52 rounded-2xl animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.04)', animationDelay: `${i * 0.06}s` }}
                />
              ))}
            </div>
          )}

          {/* ── ERROR ────────────────────────────────────────────────────── */}
          {error && (
            <div
              className="rounded-xl px-5 py-4 text-[15px] text-red-300 mb-4"
              style={{ border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)' }}
            >
              {error}
            </div>
          )}

          {/* ── NOT AUTHENTICATED ─────────────────────────────────────────── */}
          {authenticated === false && !loading && (
            <div className="glass-card p-12 text-center mt-4">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.09] flex items-center justify-center mx-auto mb-5">
                <Github className="w-6 h-6 text-[#666]" />
              </div>
              <p className="text-lg font-semibold mb-2">Connect your GitHub account</p>
              <p className="text-[15px] text-[#666] mb-8 max-w-md mx-auto">Authorize GitHub to view and manage your deployments.</p>
              <Button asChild className="h-11 px-6 bg-white text-black hover:bg-white/90 text-[15px] rounded-xl font-medium">
                <Link href="/login">Connect GitHub</Link>
              </Button>
            </div>
          )}

          {/* ── MAIN TABLE ───────────────────────────────────────────────── */}
          {authenticated && (
            <section className="pb-20">
              {/* search bar */}
              <div className="flex items-center justify-between mb-5">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555] pointer-events-none" />
                  <Input
                    className="search-input w-80 h-10 pl-10 text-[15px] bg-[#111] border-white/[0.08] text-white rounded-xl"
                    style={{ outline: 'none' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search deployments..."
                  />
                </div>
                <span className="text-sm text-[#666] font-mono">
                  {filteredDeployments.length} deployment{filteredDeployments.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* empty state */}
              {filteredDeployments.length === 0 && !loading && (
                <div className="glass-card py-20 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mx-auto mb-5">
                    <Github className="w-6 h-6 text-[#555]" />
                  </div>
                  <p className="text-lg font-semibold mb-2">No deployments found</p>
                  <p className="text-[15px] text-[#666] mb-8">
                    {search ? "Try a different search term." : "Deploy your first project to get started."}
                  </p>
                  {!search && (
                    <Button asChild className="h-10 px-6 bg-white text-black hover:bg-white/90 text-sm rounded-xl font-medium">
                      <Link href="/projects/new">New Project</Link>
                    </Button>
                  )}
                </div>
              )}

              {/* ── CARD GRID ──────────────────────────────────────────────── */}
              {filteredDeployments.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredDeployments.map((dep) => {
                    const updatedTime = dep.updatedAt || dep.createdAt;
                    const [repoOwner, repoName] = (dep.repoFullName || "").split("/");

                    return (
                      <Link
                        key={dep._id}
                        href={`/projects/${dep._id}`}
                        className="deploy-card block rounded-2xl p-6 cursor-pointer"
                        style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
                      >
                        {/* card top – icon + status */}
                        <div className="flex items-start justify-between gap-2 mb-5">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
                          >
                            <Github className="w-5 h-5 text-[#777]" />
                          </div>
                          <StatusPill status={dep.status} />
                        </div>

                        {/* repo name */}
                        <div className="mb-4 min-w-0">
                          {dep.repoFullName ? (
                            <>
                              <p className="text-[13px] text-[#666] font-mono truncate">{repoOwner}/</p>
                              <p className="text-[17px] font-semibold text-white truncate leading-snug">{repoName}</p>
                            </>
                          ) : (
                            <p className="text-[17px] font-semibold text-white truncate">{dep.repoUrl}</p>
                          )}
                          <p className="text-[13px] text-[#555] font-mono mt-1.5 truncate">
                            {dep.projectSlug || "no-slug"}
                          </p>
                        </div>

                        {/* divider */}
                        <div className="my-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

                        {/* card footer – time + actions */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] text-[#555] font-mono tabular-nums truncate">
                            {updatedTime
                              ? new Date(updatedTime).toLocaleString(undefined, {
                                  month: "short", day: "numeric",
                                  hour: "2-digit", minute: "2-digit",
                                })
                              : "—"}
                          </span>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {dep.previewUrl && (
                              <a
                                href={dep.previewUrl}
                                target="_blank"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 text-[13px] text-[#666] hover:text-white transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Preview
                              </a>
                            )}
                            <span className="text-[13px] text-[#888] hover:text-white transition-colors font-medium">
                              Details →
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}

                  {/* "New project" ghost card */}
                  <Link
                    href="/projects/new"
                    className="deploy-card flex flex-col items-center justify-center rounded-2xl p-6 cursor-pointer min-h-[210px] group"
                    style={{ border: '1px dashed rgba(255,255,255,0.1)', background: 'transparent' }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <Plus className="w-5 h-5 text-[#555] group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-[15px] text-[#555] group-hover:text-white transition-colors font-medium">
                      New Project
                    </p>
                  </Link>
                </div>
              )}

            </section>
          )}
      </main>
    </>
  );
}
