"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Github, ChevronRight, Plus, Command } from "lucide-react"
import { UserMenu } from "./user-menu"
import { Button } from "@/components/ui/button"

type UserProfile = {
  login: string;
  name?: string | null;
  avatar_url: string;
};

export function Navbar({ breadcrumbs }: { breadcrumbs?: { label: string, href?: string }[] }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

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

  const triggerCmdK = () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  };

  return (
    <header className="border-b border-white/[0.07] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 max-w-6xl mx-auto px-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
            <Github className="w-4 h-4 text-black" />
          </div>
          <span className="font-semibold text-base tracking-tight">DeployKit</span>
        </Link>
        
        {breadcrumbs && breadcrumbs.length > 0 && (
          <>
            <ChevronRight className="w-4 h-4 text-[#333]" />
            {breadcrumbs.map((crumb, i) => (
              <div key={i} className="flex items-center">
                {crumb.href ? (
                  <Link href={crumb.href} className="text-[15px] text-[#888] hover:text-white transition-colors truncate max-w-[200px] font-medium">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[15px] text-white truncate max-w-[200px] font-medium">{crumb.label}</span>
                )}
                {i < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-[#333] mx-2" />
                )}
              </div>
            ))}
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* ⌘K search trigger */}
        <button
          onClick={triggerCmdK}
          className="hidden sm:flex items-center gap-2 h-9 px-3 text-sm text-[#666] hover:text-[#999] bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] rounded-xl transition-all"
        >
          <Command className="w-3.5 h-3.5" />
          <span className="text-[13px]">Search…</span>
          <kbd className="ml-2 text-[11px] text-[#555] bg-white/[0.06] border border-white/[0.08] rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
        </button>

        <Button
          asChild variant="ghost" size="sm"
          className="h-9 px-3 text-sm text-[#888] hover:text-white hover:bg-white/[0.06] rounded-xl"
        >
          <Link href="/dashboard">Dashboard</Link>
        </Button>

        <Button
          asChild size="sm"
          className="h-9 px-4 text-sm bg-white text-black hover:bg-white/90 rounded-xl font-medium"
        >
          <Link href="/projects/new">
            <Plus className="w-4 h-4 mr-1.5" />
            New Project
          </Link>
        </Button>
        
        {authenticated === false && (
          <Button
            asChild variant="outline" size="sm"
            className="h-9 text-sm border-white/10 text-[#888] hover:text-white bg-transparent rounded-xl"
          >
            <Link href="/login">Login</Link>
          </Button>
        )}

        {authenticated && profile && (
          <UserMenu profile={profile} />
        )}
      </div>
      </div>
    </header>
  );
}
