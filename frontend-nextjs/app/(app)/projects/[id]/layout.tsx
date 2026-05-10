"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/app/navbar";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Github, RotateCcw } from "lucide-react";
import { StatusPill } from "@/components/app/status-pill";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Deployment = {
  _id: string;
  repoUrl: string;
  repoFullName?: string | null;
  projectSlug?: string;
  status?: string;
  previewUrl?: string;
};

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const deploymentId = params?.id;

  const [deployment, setDeployment] = useState<Deployment | null>(null);

  useEffect(() => {
    if (!deploymentId) return;
    fetch(`/api/deployments/${deploymentId}`)
      .then(res => res.json())
      .then(data => { if (!data.error) setDeployment(data); })
      .catch(() => {});
  }, [deploymentId]);

  const isActiveTab = (href: string, isOverview: boolean) => {
    if (isOverview) return pathname === href;
    return pathname.startsWith(href);
  };

  const tabs = [
    { label: "Overview", href: `/projects/${deploymentId}`, isOverview: true },
    { label: "Deployments", href: `/projects/${deploymentId}/deployments` },
    { label: "Logs", href: `/projects/${deploymentId}/logs` },
    { label: "Settings", href: `/projects/${deploymentId}/settings` },
    { label: "Environment", href: `/projects/${deploymentId}/env` },
    { label: "Domains", href: `/projects/${deploymentId}/domains` },
    { label: "Analytics", href: `/projects/${deploymentId}/analytics` },
  ];

  const handleRedeploy = () => {
    toast.promise(new Promise(r => setTimeout(r, 1500)), {
      loading: "Triggering redeployment…",
      success: "Deployment queued successfully",
      error: "Failed to redeploy",
    });
  };

  return (
    <>
      <Navbar breadcrumbs={[
        { label: "Projects", href: "/dashboard" },
        { label: deployment?.repoFullName || "Deployment" }
      ]} />
      <main className="max-w-6xl mx-auto px-6 pt-10">
        
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {deployment?.repoFullName || "Loading…"}
            </h1>
            {deployment?.repoUrl && (
              <a href={deployment.repoUrl} target="_blank" className="text-[15px] text-[#666] hover:text-[#999] transition-colors mt-2 flex items-center gap-2 w-fit">
                <Github className="w-4 h-4" />
                {deployment.repoUrl}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {deployment && <StatusPill status={deployment.status} />}
            <Button
              onClick={handleRedeploy}
              variant="outline"
              size="sm"
              className="h-9 px-4 text-sm border-white/10 bg-transparent text-[#bbb] hover:text-white hover:bg-white/5 rounded-xl"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Redeploy
            </Button>
            {deployment?.previewUrl && (
              <Button asChild size="sm" className="h-9 px-4 text-sm bg-white text-black hover:bg-white/90 rounded-xl font-medium">
                <a href={deployment.previewUrl} target="_blank">
                  Visit <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* ── TABS ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 border-b border-white/[0.07] mb-10 overflow-x-auto scrollbar-thin">
          {tabs.map(tab => {
            const active = isActiveTab(tab.href, tab.isOverview ?? false);
            return (
              <Link 
                key={tab.label} 
                href={tab.href}
                className={`py-3.5 px-4 text-[15px] font-medium transition-colors whitespace-nowrap border-b-2 -mb-[1px] rounded-t-lg ${
                  active
                    ? "border-white text-white"
                    : "border-transparent text-[#666] hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* ── CONTENT ────────────────────────────────────────────────── */}
        <div className="pb-20">
          {children}
        </div>
      </main>
    </>
  );
}
