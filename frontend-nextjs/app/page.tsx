"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

type UserProfile = {
  login: string;
  name?: string | null;
  avatar_url: string;
};

export default function LandingPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const status = await fetch("/api/auth/status").then((res) => res.json());
        const isAuthed = Boolean(status?.authenticated);
        setAuthenticated(isAuthed);
        if (!isAuthed) return;
        const userResponse = await fetch("/api/github/user");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setProfile(userData);
        }
      } catch {
        setAuthenticated(false);
      }
    };

    load();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="text-2xl" />
            <span className="font-semibold text-lg">Vercel Clone</span>
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
                <Link href="/login">GitHub Login</Link>
              </Button>
            )}
          </div>
        </header>

        <section className="mt-12 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight">
              Self-hosted deployments for your GitHub repos.
            </h1>
            <p className="text-slate-400">
              Authorize GitHub, pick a repo, configure env vars, and deploy with
              local Docker + MinIO.
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link href={authenticated ? "/dashboard" : "/login"}>
                  {authenticated ? "Go to dashboard" : "Connect GitHub"}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">View dashboard</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">How it works</h2>
            <div className="space-y-4 text-sm text-slate-400">
              <div>
                <p className="font-semibold text-slate-200">1. Login</p>
                <p>Authorize GitHub with repo access.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-200">2. Choose repo</p>
                <p>Select a repo and set any required env vars.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-200">3. Deploy</p>
                <p>Build runs locally and outputs to MinIO.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
