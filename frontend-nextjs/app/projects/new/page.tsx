"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Github } from "lucide-react";
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
    if (repoParam) {
      setRepoURL(repoParam);
    }
  }, []);

  useEffect(() => {
    if (selectedRepo?.html_url) {
      setRepoURL(selectedRepo.html_url);
    }
  }, [selectedRepo]);

  useEffect(() => {
    const load = async () => {
      try {
        const status = await fetch("/api/auth/status").then((res) => res.json());
        const isAuthed = Boolean(status?.authenticated);
        setAuthenticated(isAuthed);
        if (!isAuthed) return;

        const [userRes, repoRes] = await Promise.all([
          fetch("/api/github/user"),
          fetch("/api/github/repos"),
        ]);

        if (!userRes.ok || !repoRes.ok) {
          throw new Error("Failed to load GitHub data");
        }

        const userData = await userRes.json();
        const repoData = await repoRes.json();
        setProfile(userData);
        setRepos(Array.isArray(repoData) ? repoData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    load();
  }, []);

  const filteredRepos = useMemo(() => {
    const value = search.toLowerCase();
    return repos.filter((repo) => repo.full_name.toLowerCase().includes(value));
  }, [repos, search]);

  const isValidRepoUrl = useMemo(() => {
    if (!repoURL) return false;
    const regex = new RegExp(
      /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\/)?$/
    );
    return regex.test(repoURL);
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
      if (!deploymentId) {
        throw new Error("Deployment id not returned");
      }
      router.push(`/projects/${deploymentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deployment");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="text-2xl" />
            <span className="text-lg font-semibold">New Project</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            {authenticated && profile ? (
              <Link href="/dashboard" className="flex items-center gap-2">
                <img
                  src={profile.avatar_url}
                  alt={profile.login}
                  className="h-8 w-8 rounded-full border border-slate-700"
                />
                <span className="text-sm text-slate-200">
                  {profile.name || profile.login}
                </span>
              </Link>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </header>

        {error && (
          <div className="rounded-lg border border-rose-700/60 bg-rose-950/20 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {authenticated === false && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-6">
            <p className="text-sm text-slate-400">
              Connect GitHub to create a deployment.
            </p>
            <Button asChild className="mt-4">
              <Link href="/login">Connect GitHub</Link>
            </Button>
          </div>
        )}

        {authenticated && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Choose repository</h2>
                <span className="text-xs text-slate-400">
                  {filteredRepos.length} repos
                </span>
              </div>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search repositories"
              />
              <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {filteredRepos.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => setSelectedRepo(repo)}
                    className={`w-full rounded-md border px-3 py-2 text-left transition ${
                      selectedRepo?.id === repo.id
                        ? "border-sky-500 bg-slate-900"
                        : "border-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{repo.full_name}</p>
                      {repo.private && (
                        <span className="text-xs text-slate-400">Private</span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="mt-1 text-xs text-slate-400">
                        {repo.description}
                      </p>
                    )}
                  </button>
                ))}
                {filteredRepos.length === 0 && (
                  <p className="text-sm text-slate-400">No repositories found.</p>
                )}
              </div>
            </section>

            <section className="space-y-5">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
                <h2 className="font-semibold">Deploy settings</h2>
                <Input
                  value={repoURL}
                  onChange={(e) => setRepoURL(e.target.value)}
                  type="url"
                  placeholder="https://github.com/owner/repo"
                />
                <Button
                  className="w-full"
                  onClick={handleCreate}
                  disabled={!isValidRepoUrl || submitting}
                >
                  {submitting ? "Creating..." : "Deploy"}
                </Button>
                <p className="text-xs text-slate-400">
                  You’ll be redirected to a deployment details page with live
                  status and logs.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-3">
                <h3 className="font-semibold">Environment variables</h3>
                <p className="text-sm text-slate-400">
                  If your app needs env vars, add them in your repository before
                  deploying.
                </p>
                <div className="rounded-md bg-slate-900 p-3 font-mono text-xs text-slate-300">
                  VITE_API_URL=http://localhost:9000
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
