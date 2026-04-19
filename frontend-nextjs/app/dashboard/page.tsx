"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Github } from "lucide-react";
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

  const filteredDeployments = useMemo(() => {
    const value = search.toLowerCase().trim();
    if (!value) return deployments;
    return deployments.filter((deployment) =>
      `${deployment.repoFullName || deployment.repoUrl} ${deployment.projectSlug || ""}`
        .toLowerCase()
        .includes(value)
    );
  }, [deployments, search]);

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="text-2xl" />
            <span className="text-lg font-semibold">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/">Landing</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/projects/new">New repo</Link>
            </Button>
            {authenticated && profile ? (
              <Link href="/projects/new" className="flex items-center gap-2">
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

        {loading && <p className="text-sm text-slate-400">Loading dashboard…</p>}
        {error && (
          <div className="rounded-lg border border-rose-700/60 bg-rose-950/20 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {authenticated === false && !loading && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-6">
            <p className="text-sm text-slate-400">
              Connect GitHub to view and manage deployments.
            </p>
            <Button asChild className="mt-4">
              <Link href="/login">Connect GitHub</Link>
            </Button>
          </div>
        )}

        {authenticated && (
          <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold">Your deployments</h2>
              <Input
                className="sm:w-80"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search deployments"
              />
            </div>

            {filteredDeployments.length === 0 && !loading && (
              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
                No deployments yet. Click <span className="text-slate-200">New repo</span>{" "}
                to deploy your first project.
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-3 pr-4 font-medium">Project</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Updated</th>
                    <th className="pb-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeployments.map((deployment) => (
                    <tr key={deployment._id} className="border-b border-slate-900">
                      <td className="py-4 pr-4">
                        <p className="font-medium">
                          {deployment.repoFullName || deployment.repoUrl}
                        </p>
                        <p className="text-xs text-slate-400">
                          {deployment.projectSlug || "No slug"}
                        </p>
                      </td>
                      <td className="py-4 pr-4">
                        <StatusPill status={deployment.status} />
                      </td>
                      <td className="py-4 pr-4 text-slate-400">
                        {deployment.updatedAt
                          ? new Date(deployment.updatedAt).toLocaleString()
                          : deployment.createdAt
                            ? new Date(deployment.createdAt).toLocaleString()
                            : "-"}
                      </td>
                      <td className="py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {deployment.previewUrl && (
                            <a
                              href={deployment.previewUrl}
                              target="_blank"
                              className="text-sky-400 hover:underline"
                            >
                              Preview
                            </a>
                          )}
                          <Link
                            href={`/projects/${deployment._id}`}
                            className="text-slate-200 hover:underline"
                          >
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
