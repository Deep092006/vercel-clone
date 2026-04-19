"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Repo = {
  id: number;
  full_name: string;
  html_url: string;
  private: boolean;
};

export default function GithubReposPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/github/repos");
        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload?.error || "Failed to load repositories");
        }
        const data = await response.json();
        setRepos(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <main className="flex justify-center items-center h-[100vh]">
      <div className="w-[700px] space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">GitHub Repositories</h1>
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>

        {loading && <p className="text-sm text-slate-400">Loading…</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}

        {!loading && !error && repos.length === 0 && (
          <p className="text-sm text-slate-400">No repositories found.</p>
        )}

        <div className="space-y-2">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="flex justify-between items-center border border-slate-700 rounded-md px-3 py-2"
            >
              <a
                href={repo.html_url}
                target="_blank"
                className="text-sky-400 hover:underline"
              >
                {repo.full_name}
              </a>
              {repo.private && (
                <span className="text-xs text-slate-400">Private</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
