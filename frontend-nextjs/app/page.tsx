// → app/page.tsx  (or wherever your landing route lives)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, ArrowRight, Zap, GitBranch, Globe } from "lucide-react";

type UserProfile = {
  login: string;
  name?: string | null;
  avatar_url: string;
};

export default function LandingPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // ── unchanged logic ───────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const status = await fetch("/api/auth/status").then((r) => r.json());
        const isAuthed = Boolean(status?.authenticated);
        setAuthenticated(isAuthed);
        if (!isAuthed) return;
        const userResponse = await fetch("/api/github/user");
        if (userResponse.ok) setProfile(await userResponse.json());
      } catch {
        setAuthenticated(false);
      }
    };
    load();
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500&display=swap');

        :root { font-family: 'Geist', system-ui, sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
        .fu1 { animation: fadeUp .65s ease .08s both; }
        .fu2 { animation: fadeUp .65s ease .2s  both; }
        .fu3 { animation: fadeUp .65s ease .34s both; }
        .fu4 { animation: fadeUp .65s ease .48s both; }
        .fu5 { animation: fadeUp .65s ease .62s both; }

        .dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .hero-glow {
          background: radial-gradient(ellipse 80% 55% at 50% -10%, rgba(120,119,198,0.18) 0%, transparent 70%);
        }
        .card-border {
          border: 1px solid rgba(255,255,255,0.08);
          background: linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%);
        }
        .step-card:hover .step-icon { border-color: rgba(255,255,255,0.22); background: rgba(255,255,255,0.07); }
        .step-icon { transition: border-color .2s, background .2s; }
        .badge-dot { animation: pulseGlow 2s ease-in-out infinite; }
      `}</style>

      <main className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative">

        {/* ── dot grid ── */}
        <div className="dot-grid fixed inset-0 pointer-events-none" />

        {/* ── ambient glow ── */}
        <div className="hero-glow fixed inset-0 pointer-events-none" />

        {/* ── side fade vignette ── */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 100%, rgba(10,10,10,0.9) 0%, transparent 60%)' }}
        />

        <div className="relative max-w-6xl mx-auto px-6">

          {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
          <header className="flex items-center justify-between h-14 border-b border-white/[0.07]">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <Github className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="font-semibold text-sm tracking-tight">DeployKit</span>
            </div>

            <nav className="flex items-center gap-1">
              <Button
                asChild variant="ghost" size="sm"
                className="text-[#888] hover:text-white hover:bg-white/[0.06] h-8 text-xs rounded-lg px-3"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>

              {authenticated && profile ? (
                <Link href="/dashboard" className="ml-2 flex items-center gap-2 group">
                  <img
                    src={profile.avatar_url}
                    alt={profile.login}
                    className="h-7 w-7 rounded-full border border-white/20 group-hover:border-white/40 transition-all"
                  />
                </Link>
              ) : (
                <Button
                  asChild size="sm"
                  className="ml-2 h-8 px-4 text-xs bg-white text-black hover:bg-white/90 rounded-lg font-medium"
                >
                  <Link href="/login">
                    <Github className="w-3.5 h-3.5 mr-1.5" />
                    Login with GitHub
                  </Link>
                </Button>
              )}
            </nav>
          </header>

          {/* ── HERO ───────────────────────────────────────────────────────── */}
          <section className="pt-28 pb-24 text-center max-w-3xl mx-auto">

            {/* badge */}
            <div className="fu1 inline-flex items-center gap-2 border border-white/[0.1] rounded-full px-3.5 py-1.5 text-xs text-[#888] mb-8 bg-white/[0.03] backdrop-blur-sm">
              <span className="badge-dot w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Self-hosted · Open Source · Docker powered
            </div>

            <h1 className="fu2 text-5xl sm:text-[64px] font-extrabold tracking-[-0.04em] leading-[1.06] mb-6">
              Deploy GitHub repos<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white/60 to-white/20">
                in seconds.
              </span>
            </h1>

            <p className="fu3 text-[#666] text-lg leading-relaxed mb-10 max-w-lg mx-auto">
              Authorize GitHub, pick a repo, configure env vars, and deploy
              with local Docker and MinIO. Real-time logs. Instant previews.
            </p>

            <div className="fu4 flex items-center justify-center gap-3">
              <Button
                asChild
                className="h-11 px-6 bg-white text-black hover:bg-white/90 text-sm font-semibold rounded-xl shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_4px_24px_rgba(255,255,255,0.08)]"
              >
                <Link href={authenticated ? "/dashboard" : "/login"}>
                  {authenticated ? "Go to dashboard" : "Start deploying"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild variant="outline"
                className="h-11 px-6 text-sm border-white/10 text-[#999] hover:text-white hover:border-white/20 rounded-xl bg-transparent"
              >
                <Link href="/projects/new">New Project →</Link>
              </Button>
            </div>
          </section>

          {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
          <section className="fu5 pb-28">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
            >
              {/* section header */}
              <div
                className="flex items-center gap-3 px-6 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#444]">
                  How it works
                </span>
              </div>

              {/* 3 columns */}
              <div className="grid sm:grid-cols-3">
                {[
                  {
                    n: "01", icon: Github,
                    title: "Connect GitHub",
                    desc: "Authorize with GitHub OAuth. We request only the repo access you choose.",
                  },
                  {
                    n: "02", icon: GitBranch,
                    title: "Choose a repo",
                    desc: "Select from your public or private repos and configure any environment variables.",
                  },
                  {
                    n: "03", icon: Zap,
                    title: "Deploy instantly",
                    desc: "Build runs in Docker locally. Static output is served from MinIO with a preview URL.",
                  },
                ].map(({ n, icon: Icon, title, desc }, i) => (
                  <div
                    key={n}
                    className="step-card p-6 group cursor-default"
                    style={i < 2 ? { borderRight: '1px solid rgba(255,255,255,0.07)' } : {}}
                  >
                    <div className="step-icon mb-4 w-8 h-8 rounded-lg border border-white/[0.09] bg-white/[0.04] flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-[#777]" />
                    </div>
                    <p className="text-[10px] font-mono text-[#444] mb-2 tracking-widest">{n}</p>
                    <p className="text-sm font-semibold text-white mb-1.5">{title}</p>
                    <p className="text-sm text-[#555] leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}