"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/app/navbar";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Trash2, Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

type UserProfile = {
  login: string;
  name?: string | null;
  avatar_url: string;
  html_url: string;
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    fetch("/api/github/user")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProfile(data))
      .finally(() => setLoading(false));
  }, []);

  const handleCopyToken = () => {
    navigator.clipboard.writeText("dk_mock_token_1234567890abcdef");
    toast.success("Token copied to clipboard");
  };

  const handleRegenerate = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
      loading: "Regenerating token...",
      success: "New API token generated successfully",
      error: "Failed to regenerate token",
    });
  };

  const handleDeleteAccount = () => {
    toast.error("Account deletion is disabled in demo mode.");
  };

  if (loading) {
    return (
      <>
        <Navbar breadcrumbs={[{ label: "Settings" }]} />
        <main className="max-w-4xl mx-auto px-6 py-10 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-6 h-6 animate-spin text-[#666]" />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar breadcrumbs={[{ label: "Settings" }]} />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight mb-8">Account Settings</h1>

        <div className="space-y-8">
          {/* ── PROFILE ─────────────────────────────────────────────────── */}
          <section>
            <h2 className="section-header mb-3">Profile</h2>
            <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {profile ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.login}
                    className="w-16 h-16 rounded-full border border-white/10"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10" />
                )}
                <div>
                  <h3 className="text-lg font-semibold">{profile?.name || profile?.login || "Unknown User"}</h3>
                  <p className="text-sm text-[#888]">{profile?.login ? `@${profile.login}` : "Not connected"}</p>
                  {profile?.html_url && (
                    <a href={profile.html_url} target="_blank" className="text-xs text-sky-400 hover:underline mt-1 block">
                      View on GitHub
                    </a>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#555] font-mono">Member since</p>
                <p className="text-sm font-medium">May 2026</p>
              </div>
            </div>
          </section>

          {/* ── USAGE ───────────────────────────────────────────────────── */}
          <section>
            <h2 className="section-header mb-3">Usage & Limits</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Deployments", value: "24", max: "100" },
                { label: "Storage", value: "128MB", max: "1GB" },
                { label: "Build Minutes", value: "47m", max: "100h" },
                { label: "Projects", value: "6", max: "Unlimited" },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-5">
                  <p className="text-xs text-[#666] font-medium mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                  <p className="text-[10px] text-[#444] uppercase tracking-wider">Limit: {stat.max}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── API TOKEN ───────────────────────────────────────────────── */}
          <section>
            <h2 className="section-header mb-3">Personal Access Token</h2>
            <div className="glass-card p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">CLI & API Authentication</h3>
                  <p className="text-xs text-[#888] leading-relaxed mt-1 max-w-xl">
                    Use this token to authenticate with the DeployKit CLI or API. Keep it secret.
                    If compromised, regenerate it immediately.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 max-w-lg mt-6">
                <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between font-mono text-sm">
                  <span className={showToken ? "text-white" : "text-[#555]"}>
                    {showToken ? "dk_mock_token_1234567890abcdef" : "dk_••••••••••••••••••••••••••••"}
                  </span>
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="text-[#666] hover:text-white transition-colors"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button variant="outline" size="sm" onClick={handleCopyToken} className="h-9 px-3 border-white/10 text-white bg-transparent hover:bg-white/5">
                  <Copy className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Copy</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleRegenerate} className="h-9 px-3 border-white/10 text-white bg-transparent hover:bg-white/5">
                  <RefreshCw className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Roll</span>
                </Button>
              </div>
            </div>
          </section>

          {/* ── DANGER ZONE ─────────────────────────────────────────────── */}
          <section>
            <h2 className="section-header mb-3 text-red-500/80">Danger Zone</h2>
            <div className="glass-card p-6 border-red-500/20 bg-red-500/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="font-semibold text-sm text-red-400 mb-1">Delete Account</h3>
                <p className="text-xs text-red-400/70 max-w-md">
                  Permanently delete your account, all projects, deployments, and stored artifacts. This action cannot be undone.
                </p>
              </div>
              <Button onClick={handleDeleteAccount} variant="destructive" className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 whitespace-nowrap">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
