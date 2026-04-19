"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

type UserProfile = {
  login: string;
  name?: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
};

type Deployment = {
  _id: string;
  repoUrl: string;
  repoFullName?: string | null;
  projectSlug?: string;
  previewUrl?: string;
  status?: string;
  createdAt?: string;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const status = await fetch("/api/auth/status").then((res) => res.json());
        const isAuthed = Boolean(status?.authenticated);
        setAuthenticated(isAuthed);
        if (!isAuthed) {
          setLoading(false);
          return;
        }

        const [userRes, deploymentsRes] = await Promise.all([
          fetch("/api/github/user"),
          fetch("/api/deployments"),
        ]);

        if (!userRes.ok || !deploymentsRes.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const userData = await userRes.json();
        const deploymentsData = await deploymentsRes.json();
        setProfile(userData);
        setDeployments(Array.isArray(deploymentsData) ? deploymentsData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="text-2xl" />
            <span className="font-semibold text-lg">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/">Landing</Link>
            </Button>
            {authenticated && profile ? (
              <Link href="/repos" className="flex items-center gap-2">
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

        {loading && <p className="text-sm text-slate-400">Loading…</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}

        {authenticated === false && !loading && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-6">
            <p className="text-sm text-slate-400">
              Connect GitHub to see your deployments.
            </p>
            <Button asChild className="mt-4">
              <Link href="/login">Connect GitHub</Link>
            </Button>
          </div>
        )}

        {authenticated && (
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {profile && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4 h-fit">
                <div className="flex items-center gap-3">
                  <img
                    src={profile.avatar_url}
                    alt={profile.login}
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">
                      {profile.name || profile.login}
                    </p>
                    <a
                      href={profile.html_url}
                      target="_blank"
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      @{profile.login}
                    </a>
                  </div>
                </div>
                <div className="text-sm text-slate-400 space-y-1">
                  <p>{profile.public_repos} public repos</p>
                  <p>{profile.followers} followers</p>
                </div>
                <Button asChild className="w-full">
                  <Link href="/repos">New repo</Link>
                </Button>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Your deployments</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/repos">New repo</Link>
                </Button>
              </div>

              {deployments.length === 0 && !loading && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-6 text-sm text-slate-400">
                  No deployments yet. Click “New repo” to deploy your first
                  project.
                </div>
              )}

              <div className="grid gap-3">
                {deployments.map((deployment) => (
                  <div
                    key={deployment._id}
                    className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {deployment.repoFullName || deployment.repoUrl}
                        </p>
                        <p className="text-xs text-slate-400">
                          {deployment.status || "queued"}
                        </p>
                      </div>
                      {deployment.previewUrl && (
                        <a
                          href={deployment.previewUrl}
                          target="_blank"
                          className="text-sm text-sky-400 hover:underline"
                        >
                          Open preview
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {deployment.createdAt
                        ? new Date(deployment.createdAt).toLocaleString()
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
