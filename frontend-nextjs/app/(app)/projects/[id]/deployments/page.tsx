"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { StatusPill } from "@/components/app/status-pill";
import { ExternalLink, GitBranch, RotateCcw, ArrowUpCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Deployment = {
  _id: string;
  status: string;
  createdAt: string;
  previewUrl?: string;
  projectSlug?: string;
  commitMessage?: string;
  commitHash?: string;
  branch?: string;
  duration?: string;
};

type StatusFilter = "all" | "ready" | "failed" | "building";

export default function DeploymentsHistoryPage() {
  const params = useParams<{ id: string }>();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    fetch(`/api/deployments/${params?.id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setDeployments([
            { ...data, commitMessage: "fix: update header alignment", commitHash: "a3f2b1c", branch: "main", duration: "45s" },
            { ...data, _id: "m1", status: "ready", createdAt: new Date(Date.now() - 3600000).toISOString(), commitMessage: "feat: add analytics dashboard", commitHash: "8e1d4f2", branch: "main", duration: "1m 12s" },
            { ...data, _id: "m2", status: "ready", createdAt: new Date(Date.now() - 86400000).toISOString(), commitMessage: "feat: add settings page", commitHash: "b7c3a91", branch: "main", duration: "58s" },
            { ...data, _id: "m3", status: "failed", createdAt: new Date(Date.now() - 172800000).toISOString(), commitMessage: "wip: new dashboard layout", commitHash: "c2a9e3b", branch: "feat/ui", duration: "32s" },
            { ...data, _id: "m4", status: "ready", createdAt: new Date(Date.now() - 259200000).toISOString(), commitMessage: "chore: update dependencies", commitHash: "d4e5f67", branch: "main", duration: "1m 5s" },
            { ...data, _id: "m5", status: "ready", createdAt: new Date(Date.now() - 345600000).toISOString(), commitMessage: "feat: add command palette", commitHash: "f8a9b01", branch: "feat/cmdk", duration: "52s" },
            { ...data, _id: "m6", status: "failed", createdAt: new Date(Date.now() - 432000000).toISOString(), commitMessage: "fix: resolve build error in prod", commitHash: "12c3d4e", branch: "hotfix/build", duration: "18s" },
            { ...data, _id: "m7", status: "ready", createdAt: new Date(Date.now() - 604800000).toISOString(), commitMessage: "initial commit", commitHash: "0000000", branch: "main", duration: "2m 1s" },
          ]);
        }
      })
      .finally(() => setLoading(false));
  }, [params?.id]);

  const filtered = useMemo(() => {
    if (filter === "all") return deployments;
    return deployments.filter(d => d.status === filter);
  }, [deployments, filter]);

  const handleRollback = (hash: string) => {
    toast.promise(new Promise(r => setTimeout(r, 1500)), {
      loading: `Rolling back to ${hash}…`,
      success: `Rolled back to ${hash} successfully`,
      error: "Rollback failed",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 rounded-xl bg-white/[0.02] border border-white/[0.05] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Deployment History</h2>
          <p className="text-sm text-[#888] mt-1">{deployments.length} total deployments</p>
        </div>
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] rounded-xl p-1">
          {(["all", "ready", "failed", "building"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                filter === s ? "bg-white text-black" : "text-[#888] hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f0f] overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-[15px] whitespace-nowrap">
            <thead className="bg-[#141414] border-b border-white/[0.08]">
              <tr>
                <th className="px-6 py-4 font-medium text-[#888]">Status</th>
                <th className="px-6 py-4 font-medium text-[#888]">Commit</th>
                <th className="px-6 py-4 font-medium text-[#888]">Branch</th>
                <th className="px-6 py-4 font-medium text-[#888]">Duration</th>
                <th className="px-6 py-4 font-medium text-[#888]">Time</th>
                <th className="px-6 py-4 font-medium text-[#888] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((dep, i) => (
                <tr key={dep._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <StatusPill status={dep.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 max-w-[280px]">
                      <span className="font-mono text-sm text-[#888] bg-white/[0.04] px-2 py-0.5 rounded">{dep.commitHash}</span>
                      <span className="truncate text-[#ccc]">{dep.commitMessage}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#bbb]">
                      <GitBranch className="w-4 h-4" />
                      <span className="font-mono text-sm">{dep.branch}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#888]">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-mono text-sm">{dep.duration}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#888]">
                    {new Date(dep.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {i > 0 && dep.status === "ready" && (
                        <Button
                          onClick={() => handleRollback(dep.commitHash || "")}
                          variant="ghost" size="sm"
                          className="h-8 px-3 text-xs text-[#888] hover:text-white"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                          Rollback
                        </Button>
                      )}
                      {i === 0 && dep.status === "ready" && (
                        <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
                          <ArrowUpCircle className="w-3.5 h-3.5" /> Current
                        </span>
                      )}
                      {dep.previewUrl && (
                        <a href={dep.previewUrl} target="_blank" className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-colors text-[#666] hover:text-white">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
