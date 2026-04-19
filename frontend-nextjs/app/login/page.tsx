"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [redirectUri, setRedirectUri] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/auth/config");
        const data = await response.json();
        setConfigured(Boolean(data?.configured));
        setRedirectUri(data?.redirectUri || null);
      } catch {
        setConfigured(false);
      }
    };

    load();
  }, []);

  return (
    <main className="flex justify-center items-center h-[100vh]">
      <div className="w-[420px] text-center space-y-4">
        <h1 className="text-2xl font-semibold">Sign in with GitHub</h1>
        <p className="text-sm text-slate-400">
          We request <span className="text-slate-200">repo</span> access to read
          your repositories for deployments.
        </p>
        {configured === false && (
          <div className="text-sm text-red-400">
            Missing GitHub OAuth config. Set{" "}
            <span className="text-slate-200">GITHUB_CLIENT_ID</span> and{" "}
            <span className="text-slate-200">GITHUB_CLIENT_SECRET</span> in the
            frontend container env.
            {redirectUri && (
              <p className="mt-2 text-slate-400">
                Callback: <span className="text-slate-200">{redirectUri}</span>
              </p>
            )}
          </div>
        )}
        <Button asChild className="w-full" disabled={configured === false}>
          <Link href="/api/auth/github">Continue with GitHub</Link>
        </Button>
      </div>
    </main>
  );
}
