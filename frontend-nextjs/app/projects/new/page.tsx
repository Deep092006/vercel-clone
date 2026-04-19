// → app/projects/new/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Github, Lock, Search, ChevronRight, CheckCircle2,
  XCircle, Loader2, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Repo = {
  id: number;
  full_name: string;
  html_url: string;
  private: boolean;
  description?: string | null;
};

type UserProfile = {
  login: string;
  name?: string | null;
  avatar_url: string;
  html_url: string;
};

export default function NewProjectPage() {
  // ── unchanged state & logic ──────────────────────────────────────────────
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [repoURL, setRepoURL] = useState("");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const repoParam = new URLSearchParams(window.location.search).get("repo");
    if (repoParam) setRepoURL(repoParam);
  }, []);

  useEffect(() => {
    if (selectedRepo?.html_url) setRepoURL(selectedRepo.html_url);
  }, [selectedRepo]);

  useEffect(() => {
    const load = async () => {
      try {
        const status = await fetch("/api/auth/status").then((r) => r.json());
        const isAuthed = Boolean(status?.authenticated);
        setAuthenticated(isAuthed);
        if (!isAuthed) return;

        const [userRes, repoRes] = await Promise.all([
          fetch("/api/github/user"),
          fetch("/api/github/repos"),
        ]);
        if (!userRes.ok || !repoRes.ok) throw new Error("Failed to load GitHub data");

        setProfile(await userRes.json());
        const d = await repoRes.json();
        setRepos(Array.isArray(d) ? d : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };
    load();
  }, []);

  const filteredRepos = useMemo(() => {
    const value = search.toLowerCase();
    return repos.filter((r) => r.full_name.toLowerCase().includes(value));
  }, [repos, search]);

  const isValidRepoUrl = useMemo(() => {
    if (!repoURL) return false;
    return /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\/)?$/.test(repoURL);
  }, [repoURL]);

  const handleCreate = async () => {
    if (!isValidRepoUrl || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await axios.post("/api/project", {
        gitURL: repoURL,
        repoFullName: selectedRepo?.full_name,
      });
      const deploymentId = data?.data?.deploymentId;
      if (!deploymentId) throw new Error("Deployment id not returned");
      router.push(`/projects/${deploymentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deployment");
      setSubmitting(false);
    }
  };
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
        .repo-item { transition: background .12s, border-color .12s; }
        .repo-item:hover { background: rgba(255,255,255,0.04); }
        .repo-item.selected { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.25) !important; }
        .url-input::placeholder { color: #444; font-size: 13px; }
        .url-input:focus { border-color: rgba(255,255,255,0.2) !important; box-shadow: 0 0 0 3px rgba(255,255,255,0.05); outline: none; }
        .deploy-btn:not(:disabled):hover { background: rgba(255,255,255,0.92) !important; }
        .deploy-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
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
              <span className="text-sm text-[#666]">New Project</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                asChild variant="ghost" size="sm"
                className="h-8 px-3 text-xs text-[#888] hover:text-white hover:bg-white/[0.06] rounded-lg"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              {authenticated && profile ? (
                <Link href="/dashboard" className="ml-1">
                  <img
                    src={profile.avatar_url}
                    alt={profile.login}
                    className="h-7 w-7 rounded-full border border-white/20 hover:border-white/40 transition-colors"
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
          <div className="pt-10 pb-7">
            <h1 className="text-2xl font-bold tracking-tight">Import repository</h1>
            <p className="text-sm text-[#555] mt-1">Choose a GitHub repository to deploy.</p>
          </div>

          {/* ── ERROR ────────────────────────────────────────────────────── */}
          {error && (
            <div
              className="rounded-xl px-5 py-4 text-sm text-red-300 mb-5 flex items-center gap-3"
              style={{ border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)' }}
            >
              <XCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ── NOT AUTHENTICATED ─────────────────────────────────────────── */}
          {authenticated === false && (
            <div
              className="rounded-2xl p-10 text-center"
              style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
            >
              <p className="text-sm font-medium mb-1.5">GitHub not connected</p>
              <p className="text-sm text-[#555] mb-6">Connect GitHub to browse and deploy repositories.</p>
              <Button asChild className="h-9 px-5 bg-white text-black hover:bg-white/90 text-sm rounded-xl">
                <Link href="/login">Connect GitHub</Link>
              </Button>
            </div>
          )}

          {/* ── MAIN LAYOUT ──────────────────────────────────────────────── */}
          {authenticated && (
            <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr] pb-20">

              {/* LEFT – repo browser */}
              <div
                className="rounded-2xl overflow-hidden flex flex-col"
                style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)' }}
              >
                {/* header */}
                <div
                  className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span className="text-sm font-semibold">Your repositories</span>
                  <span className="text-xs text-[#444] font-mono tabular-nums">
                    {filteredRepos.length} repos
                  </span>
                </div>

                {/* search */}
                <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444] pointer-events-none" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search repositories..."
                      className="pl-9 h-9 text-sm bg-[#0f0f0f] border-white/[0.08] text-white rounded-xl w-full url-input"
                      style={{ outline: 'none' }}
                    />
                  </div>
                </div>

                {/* list */}
                <div className="scrollbar-thin overflow-y-auto" style={{ maxHeight: 480 }}>
                  {filteredRepos.length === 0 && (
                    <div className="px-5 py-10 text-center">
                      <p className="text-sm text-[#444]">No repositories found.</p>
                    </div>
                  )}
                  {filteredRepos.map((repo, i) => (
                    <button
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo)}
                      className={`repo-item w-full text-left px-5 py-3.5 border border-transparent flex items-center justify-between gap-3 ${
                        selectedRepo?.id === repo.id ? "selected" : ""
                      }`}
                      style={i < filteredRepos.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.04)' } : {}}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                          <Github className="w-3.5 h-3.5 text-[#666]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{repo.full_name}</p>
                          {repo.description && (
                            <p className="text-xs text-[#555] truncate mt-0.5">{repo.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {repo.private && (
                          <div className="flex items-center gap-1 text-[10px] text-[#555] bg-white/[0.04] rounded-md px-2 py-0.5">
                            <Lock className="w-2.5 h-2.5" />
                            Private
                          </div>
                        )}
                        {selectedRepo?.id === repo.id && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* RIGHT – deploy settings */}
              <div className="space-y-4">

                {/* URL + deploy */}
                <div
                  className="rounded-2xl p-5 space-y-4"
                  style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)' }}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Deploy settings</h2>
                    {repoURL && (
                      <span className="flex items-center gap-1 text-xs">
                        {isValidRepoUrl
                          ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Valid URL</span></>
                          : <><XCircle className="w-3.5 h-3.5 text-red-400" /><span className="text-red-400">Invalid URL</span></>
                        }
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-[#555] block mb-1.5">Repository URL</label>
                    <Input
                      value={repoURL}
                      onChange={(e) => setRepoURL(e.target.value)}
                      type="url"
                      placeholder="https://github.com/owner/repo"
                      className="url-input h-10 text-sm bg-[#0f0f0f] border-white/[0.08] text-white rounded-xl w-full font-mono"
                      style={{ outline: 'none' }}
                    />
                  </div>

                  <button
                    onClick={handleCreate}
                    disabled={!isValidRepoUrl || submitting}
                    className="deploy-btn w-full h-10 bg-white text-black text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Deploying…</>
                    ) : (
                      <><Plus className="w-4 h-4" /> Deploy project</>
                    )}
                  </button>

                  <p className="text-[11px] text-[#444] leading-relaxed">
                    You'll be redirected to the deployment details page with live status and logs.
                  </p>
                </div>

                {/* env vars info */}
                <div
                  className="rounded-2xl p-5 space-y-3"
                  style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)' }}
                >
                  <h3 className="text-sm font-semibold">Environment variables</h3>
                  <p className="text-xs text-[#555] leading-relaxed">
                    If your app requires environment variables, add them to your repository before deploying.
                  </p>
                  <div
                    className="rounded-xl p-4 font-mono text-xs leading-relaxed"
                    style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    {/* terminal chrome dots */}
                    <div className="flex gap-1.5 mb-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                    </div>
                    <span className="text-[#555]"># .env</span><br />
                    <span className="text-emerald-400">VITE_API_URL</span>
                    <span className="text-[#555]">=</span>
                    <span className="text-sky-400">http://localhost:9000</span>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}