"use client";

import { Navbar } from "@/components/app/navbar";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Github, Lock, Search, CheckCircle2,
  XCircle, Loader2, Plus, ChevronDown, ChevronUp, Box, Trash2
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

type EnvVar = {
  key: string;
  value: string;
};

export default function NewProjectPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [repoURL, setRepoURL] = useState("");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Advanced Settings State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showEnvVars, setShowEnvVars] = useState(false);
  const [framework, setFramework] = useState("Other");
  const [buildCommand, setBuildCommand] = useState("");
  const [outputDir, setOutputDir] = useState("");
  const [installCommand, setInstallCommand] = useState("");
  
  const [envVars, setEnvVars] = useState<EnvVar[]>([{ key: "", value: "" }]);

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
      // Filter out empty env vars
      const finalEnvVars = envVars.filter(e => e.key.trim() !== "");

      // Pass new configuration to the backend (even if backend doesn't fully support it yet, we prepare the payload)
      const { data } = await axios.post("/api/project", {
        gitURL: repoURL,
        repoFullName: selectedRepo?.full_name,
        framework,
        buildCommand: buildCommand || null,
        outputDir: outputDir || null,
        installCommand: installCommand || null,
        envVars: finalEnvVars
      });
      const deploymentId = data?.data?.deploymentId;
      if (!deploymentId) throw new Error("Deployment id not returned");
      router.push(`/projects/${deploymentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deployment");
      setSubmitting(false);
    }
  };

  const addEnvVar = () => setEnvVars([...envVars, { key: "", value: "" }]);
  
  const updateEnvVar = (index: number, field: "key" | "value", val: string) => {
    const newVars = [...envVars];
    newVars[index][field] = val;
    setEnvVars(newVars);
  };

  const removeEnvVar = (index: number) => {
    const newVars = envVars.filter((_, i) => i !== index);
    if (newVars.length === 0) newVars.push({ key: "", value: "" });
    setEnvVars(newVars);
  };

  return (
    <>
      <Navbar breadcrumbs={[{ label: "New Project" }]} />
      <main className="max-w-6xl mx-auto px-6">

          {/* ── PAGE TITLE ───────────────────────────────────────────────── */}
          <div className="pt-12 pb-8">
            <h1 className="text-3xl font-bold tracking-tight">Import repository</h1>
            <p className="text-[15px] text-[#888] mt-2">Select a repository from your GitHub account to deploy.</p>
          </div>

          {/* ── ERROR ────────────────────────────────────────────────────── */}
          {error && (
            <div
              className="rounded-lg px-5 py-4 text-sm text-red-400 mb-6 flex items-center gap-3"
              style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}
            >
              <XCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ── NOT AUTHENTICATED ─────────────────────────────────────────── */}
          {authenticated === false && (
            <div className="glass-card p-12 text-center max-w-2xl mx-auto mt-10">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mx-auto mb-5">
                <Github className="w-6 h-6 text-[#666]" />
              </div>
              <p className="text-lg font-semibold mb-2">GitHub not connected</p>
              <p className="text-[15px] text-[#888] mb-8">Connect GitHub to browse and deploy repositories.</p>
              <Button asChild className="h-11 px-6 bg-white text-black hover:bg-white/90 text-[15px] rounded-lg font-medium">
                <Link href="/login">Connect GitHub</Link>
              </Button>
            </div>
          )}

          {/* ── MAIN LAYOUT ──────────────────────────────────────────────── */}
          {authenticated && (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] pb-32">

              {/* LEFT – repo browser */}
              <div className="glass-card overflow-hidden flex flex-col h-[600px]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] bg-[#0a0a0a]">
                  <span className="text-[15px] font-semibold">Your repositories</span>
                  <span className="text-[13px] text-[#666] font-mono tabular-nums">
                    {filteredRepos.length} repos
                  </span>
                </div>

                <div className="px-5 py-4 border-b border-white/[0.08] bg-[#050505]">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555] pointer-events-none" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search repositories..."
                      className="pl-10 h-10 text-[15px] bg-black border-white/[0.1] text-white rounded-lg w-full focus-visible:ring-1 focus-visible:ring-white/20"
                    />
                  </div>
                </div>

                <div className="scrollbar-thin overflow-y-auto flex-1 bg-black">
                  {filteredRepos.length === 0 && (
                    <div className="px-5 py-12 text-center">
                      <p className="text-[15px] text-[#666]">No repositories found.</p>
                    </div>
                  )}
                  {filteredRepos.map((repo, i) => (
                    <button
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo)}
                      className={`w-full text-left px-6 py-4 flex items-center justify-between gap-4 transition-colors ${
                        selectedRepo?.id === repo.id ? "bg-white/[0.05]" : "hover:bg-white/[0.02]"
                      }`}
                      style={i < filteredRepos.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.05)' } : {}}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center flex-shrink-0">
                          <Github className="w-4 h-4 text-[#888]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15px] font-medium text-[#ededed] truncate">{repo.full_name}</p>
                          {repo.description && (
                            <p className="text-[13px] text-[#666] truncate mt-0.5">{repo.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {repo.private && (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#888] border border-white/[0.1] rounded-full px-2.5 py-0.5">
                            <Lock className="w-3 h-3" />
                            Private
                          </div>
                        )}
                        {selectedRepo?.id === repo.id && (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* RIGHT – deploy settings */}
              <div className="space-y-6">

                {/* Main Settings Card */}
                <div className="glass-card overflow-hidden">
                  <div className="px-6 py-5 border-b border-white/[0.08] bg-[#0a0a0a]">
                    <h2 className="text-[15px] font-semibold">Configure Project</h2>
                  </div>
                  
                  <div className="p-6 space-y-6 bg-black">
                    <div>
                      <label className="text-[13px] text-[#888] font-medium block mb-2">Repository URL</label>
                      <div className="relative">
                        <Input
                          value={repoURL}
                          onChange={(e) => setRepoURL(e.target.value)}
                          type="url"
                          placeholder="https://github.com/owner/repo"
                          className="h-10 text-[15px] bg-[#0a0a0a] border-white/[0.1] text-white rounded-lg w-full font-mono pl-3 pr-10"
                        />
                        {repoURL && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isValidRepoUrl 
                              ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              : <XCircle className="w-4 h-4 text-red-400" />
                            }
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Framework Preset */}
                    <div>
                      <label className="text-[13px] text-[#888] font-medium block mb-2">Framework Preset</label>
                      <div className="relative">
                        <select
                          value={framework}
                          onChange={(e) => setFramework(e.target.value)}
                          className="w-full h-10 text-[15px] bg-[#0a0a0a] border border-white/[0.1] text-white rounded-lg pl-3 pr-10 appearance-none outline-none focus:border-white/30 transition-colors cursor-pointer"
                        >
                          <option value="Next.js">Next.js</option>
                          <option value="Create React App">Create React App</option>
                          <option value="Vite">Vite</option>
                          <option value="Vue">Vue.js</option>
                          <option value="Svelte">Svelte</option>
                          <option value="Other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666] pointer-events-none" />
                      </div>
                    </div>

                    {/* Build & Output Settings Toggle */}
                    <div className="border-t border-white/[0.08] pt-6">
                      <button 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-[15px] font-medium text-[#ededed] hover:text-white transition-colors"
                      >
                        {showAdvanced ? <ChevronUp className="w-4 h-4 text-[#888]" /> : <ChevronDown className="w-4 h-4 text-[#888]" />}
                        Build and Output Settings
                      </button>
                      
                      {showAdvanced && (
                        <div className="mt-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div>
                            <label className="text-[13px] text-[#888] flex items-center justify-between mb-2">
                              <span>Build Command</span>
                              <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.05]">Override</span>
                            </label>
                            <Input
                              value={buildCommand}
                              onChange={(e) => setBuildCommand(e.target.value)}
                              placeholder="npm run build"
                              className="h-10 text-[14px] font-mono bg-[#0a0a0a] border-white/[0.1] rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="text-[13px] text-[#888] flex items-center justify-between mb-2">
                              <span>Output Directory</span>
                              <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.05]">Override</span>
                            </label>
                            <Input
                              value={outputDir}
                              onChange={(e) => setOutputDir(e.target.value)}
                              placeholder="public, dist, or .next"
                              className="h-10 text-[14px] font-mono bg-[#0a0a0a] border-white/[0.1] rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="text-[13px] text-[#888] flex items-center justify-between mb-2">
                              <span>Install Command</span>
                              <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.05]">Override</span>
                            </label>
                            <Input
                              value={installCommand}
                              onChange={(e) => setInstallCommand(e.target.value)}
                              placeholder="npm install"
                              className="h-10 text-[14px] font-mono bg-[#0a0a0a] border-white/[0.1] rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Environment Variables Toggle */}
                    <div className="border-t border-white/[0.08] pt-6">
                      <button 
                        onClick={() => setShowEnvVars(!showEnvVars)}
                        className="flex items-center gap-2 text-[15px] font-medium text-[#ededed] hover:text-white transition-colors"
                      >
                        {showEnvVars ? <ChevronUp className="w-4 h-4 text-[#888]" /> : <ChevronDown className="w-4 h-4 text-[#888]" />}
                        Environment Variables
                      </button>
                      
                      {showEnvVars && (
                        <div className="mt-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                          {envVars.map((env, idx) => (
                            <div key={idx} className="flex gap-3 items-start">
                              <Input
                                value={env.key}
                                onChange={(e) => updateEnvVar(idx, "key", e.target.value)}
                                placeholder="KEY"
                                className="h-10 flex-1 font-mono text-[13px] bg-[#0a0a0a] border-white/[0.1] rounded-lg uppercase"
                              />
                              <Input
                                value={env.value}
                                onChange={(e) => updateEnvVar(idx, "value", e.target.value)}
                                placeholder="VALUE"
                                className="h-10 flex-[1.5] font-mono text-[13px] bg-[#0a0a0a] border-white/[0.1] rounded-lg"
                              />
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => removeEnvVar(idx)}
                                className="h-10 w-10 flex-shrink-0 border-white/[0.1] bg-transparent text-[#666] hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button 
                            variant="ghost" 
                            onClick={addEnvVar}
                            className="h-9 px-3 text-[13px] text-[#888] hover:text-white mt-1"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                            Add Another
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Footer CTA */}
                  <div className="px-6 py-5 border-t border-white/[0.08] bg-[#0a0a0a]">
                    <Button
                      onClick={handleCreate}
                      disabled={!isValidRepoUrl || submitting}
                      className="w-full h-11 bg-white text-black hover:bg-[#e5e5e5] text-[15px] font-medium rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Deploying…</>
                      ) : (
                        <><Box className="w-4 h-4" /> Deploy</>
                      )}
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          )}
      </main>
    </>
  );
}
