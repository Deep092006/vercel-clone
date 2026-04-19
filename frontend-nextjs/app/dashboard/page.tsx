// → app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Github, Plus, Search, ChevronRight, ExternalLink } from "lucide-react";
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
  // ── unchanged state & logic ──────────────────────────────────────────────
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
        .deploy-row { transition: background .15s; }
        .deploy-row:hover { background: rgba(255,255,255,0.025); }
        .search-input::placeholder { color: #444; }
        .search-input:focus { border-color: rgba(255,255,255,0.15) !important; box-shadow: 0 0 0 3px rgba(255,255,255,0.05); }
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
              <span className="text-sm text-[#666]">Dashboard</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                asChild variant="ghost" size="sm"
                className="h-8 px-3 text-xs text-[#888] hover:text-white hover:bg-white/[0.06] rounded-lg"
              >
                <Link href="/">Home</Link>
              </Button>
              <Button
                asChild size="sm"
                className="h-8 px-3 text-xs bg-white text-black hover:bg-white/90 rounded-lg font-medium"
              >
                <Link href="/projects/new">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  New Project
                </Link>
              </Button>

              {authenticated && profile ? (
                <Link href="/projects/new" className="ml-1 flex items-center gap-2 group">
                  <img
                    src={profile.avatar_url}
                    alt={profile.login}
                    className="h-7 w-7 rounded-full border border-white/20 group-hover:border-white/40 transition-colors"
                  />
                </Link>
              ) : (
                <Button
                  asChild variant="outline" size="sm"
                  className="h-8 text-xs border-white/10 text-[#888] hover:text-white bg-transparent rounded-lg"
                >
                  <Link href="/login">Login</Link>
                </Button>
              )}
            </div>
          </header>

          {/* ── PAGE TITLE ───────────────────────────────────────────────── */}
          <div className="pt-10 pb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
              {profile && (
                <p className="text-sm text-[#555] mt-0.5">
                  {profile.name || profile.login}'s deployments
                </p>
              )}
            </div>
          </div>

          {/* ── LOADING ──────────────────────────────────────────────────── */}
          {loading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.04)', animationDelay: `${i * 0.08}s` }}
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

          {/* ── NOT AUTHENTICATED ─────────────────────────────────────────── */}
          {authenticated === false && !loading && (
            <div
              className="rounded-2xl p-10 text-center mt-4"
              style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.09] flex items-center justify-center mx-auto mb-4">
                <Github className="w-5 h-5 text-[#666]" />
              </div>
              <p className="font-semibold mb-1.5">Connect your GitHub account</p>
              <p className="text-sm text-[#555] mb-6">Authorize GitHub to view and manage your deployments.</p>
              <Button asChild className="h-9 px-5 bg-white text-black hover:bg-white/90 text-sm rounded-xl">
                <Link href="/login">Connect GitHub</Link>
              </Button>
            </div>
          )}

          {/* ── MAIN TABLE ───────────────────────────────────────────────── */}
          {authenticated && (
            <section className="pb-20">
              {/* search bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444] pointer-events-none" />
                  <Input
                    className="search-input w-72 h-9 pl-9 text-sm bg-[#111] border-white/[0.08] text-white rounded-xl"
                    style={{ outline: 'none' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search deployments..."
                  />
                </div>
                <span className="text-xs text-[#444] font-mono">
                  {filteredDeployments.length} deployment{filteredDeployments.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* empty state */}
              {filteredDeployments.length === 0 && !loading && (
                <div
                  className="rounded-2xl py-16 text-center"
                  style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
                    <Github className="w-4 h-4 text-[#555]" />
                  </div>
                  <p className="text-sm font-medium mb-1">No deployments found</p>
                  <p className="text-xs text-[#444] mb-6">
                    {search ? "Try a different search term." : "Deploy your first project to get started."}
                  </p>
                  {!search && (
                    <Button asChild size="sm" className="h-8 px-4 bg-white text-black hover:bg-white/90 text-xs rounded-lg">
                      <Link href="/projects/new">New Project</Link>
                    </Button>
                  )}
                </div>
              )}

              {/* table */}
              {filteredDeployments.length > 0 && (
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {/* table header */}
                  <div
                    className="grid grid-cols-[1fr_120px_160px_120px] px-5 py-3"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
                  >
                    {["Project", "Status", "Updated", ""].map((h) => (
                      <span key={h} className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#444]">
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* rows */}
                  {filteredDeployments.map((dep, i) => (
                    <div
                      key={dep._id}
                      className="deploy-row grid grid-cols-[1fr_120px_160px_120px] px-5 py-4 items-center cursor-pointer"
                      style={i < filteredDeployments.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.05)' } : {}}
                    >
                      {/* project name */}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {dep.repoFullName || dep.repoUrl}
                        </p>
                        <p className="text-xs text-[#555] font-mono mt-0.5 truncate">
                          {dep.projectSlug || "no-slug"}
                        </p>
                      </div>

                      {/* status */}
                      <div>
                        <StatusPill status={dep.status} />
                      </div>

                      {/* updated */}
                      <span className="text-xs text-[#555] font-mono tabular-nums">
                        {dep.updatedAt
                          ? new Date(dep.updatedAt).toLocaleString(undefined, {
                              month: "short", day: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })
                          : dep.createdAt
                            ? new Date(dep.createdAt).toLocaleString(undefined, {
                                month: "short", day: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })
                            : "—"}
                      </span>

                      {/* actions */}
                      <div className="flex items-center justify-end gap-3">
                        {dep.previewUrl && (
                          <a
                            href={dep.previewUrl}
                            target="_blank"
                            className="flex items-center gap-1 text-xs text-[#666] hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Preview
                          </a>
                        )}
                        <Link
                          href={`/projects/${dep._id}`}
                          className="text-xs text-[#888] hover:text-white transition-colors font-medium"
                        >
                          Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </>
  );
}