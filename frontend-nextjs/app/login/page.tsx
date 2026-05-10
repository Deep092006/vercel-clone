"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [redirectUri, setRedirectUri] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [configResponse, statusResponse] = await Promise.all([
          fetch("/api/auth/config"),
          fetch("/api/auth/status"),
        ]);
        const configData = await configResponse.json();
        const statusData = await statusResponse.json();
        setConfigured(Boolean(configData?.configured));
        setRedirectUri(configData?.redirectUri || null);
        setAuthenticated(Boolean(statusData?.authenticated));
      } catch {
        setConfigured(false);
        setAuthenticated(false);
      }
    };

    load();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center relative overflow-hidden font-sans">
      <div className="dot-grid fixed inset-0 pointer-events-none" />
      <div className="hero-glow fixed inset-0 pointer-events-none" />
      
      <div className="w-[420px] rounded-2xl p-8 text-center space-y-6 relative z-10 fu1 glass-card shadow-2xl shadow-black/50">
        
        <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center mx-auto shadow-lg shadow-black/20">
          <Github className="w-6 h-6 text-white" />
        </div>
        
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Sign in to DeployKit</h1>
          <p className="text-sm text-[#888]">Connect your GitHub account to deploy repositories in seconds.</p>
        </div>

        <div className="rounded-xl p-4 text-sm text-[#bbb] text-left"
             style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <Github className="w-4 h-4 text-[#888]" />
            </div>
            <div>
              <p className="font-medium text-[#ddd] mb-0.5">Repository access required</p>
              <p className="text-xs leading-relaxed text-[#777]">
                We request repository access to read your source code and trigger deployments.
              </p>
            </div>
          </div>
        </div>

        {authenticated && (
          <div className="rounded-xl px-4 py-3 text-sm text-emerald-400/90 flex items-center justify-center gap-2"
               style={{ border: '1px solid rgba(52,211,153,0.2)', background: 'rgba(52,211,153,0.05)' }}>
            <CheckCircle2 className="w-4 h-4" />
            You&apos;re already connected.
          </div>
        )}

        {configured === false && (
          <div className="rounded-xl px-4 py-3 text-sm text-red-400 text-left flex items-start gap-3"
               style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Missing OAuth config</p>
              <p className="text-xs text-red-400/80 leading-relaxed mb-2">
                Set <code className="bg-red-950/50 px-1 py-0.5 rounded">GITHUB_CLIENT_ID</code> and <code className="bg-red-950/50 px-1 py-0.5 rounded">GITHUB_CLIENT_SECRET</code> in the environment.
              </p>
              {redirectUri && (
                <p className="text-xs text-red-400/60 break-all font-mono">
                  Callback: {redirectUri}
                </p>
              )}
            </div>
          </div>
        )}

        <Button
          asChild
          className="w-full h-11 bg-white text-black hover:bg-white/90 font-medium rounded-xl transition-all"
        >
          {authenticated ? (
            <Link href="/dashboard">Go to Dashboard</Link>
          ) : configured === false ? (
            <button disabled className="opacity-50 cursor-not-allowed">Continue with GitHub</button>
          ) : (
            <Link href="/api/auth/github">Continue with GitHub</Link>
          )}
        </Button>
      </div>

      <div className="absolute bottom-6 text-[#555] text-xs font-mono fu2">
        Self-hosted &middot; Open Source
      </div>
    </main>
  );
}
