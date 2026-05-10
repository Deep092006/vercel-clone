"use client";

import { Navbar } from "@/components/app/navbar";
import { GitCommit, Settings, Plus, Trash2, Shield } from "lucide-react";

export default function ActivityPage() {
  const activities = [
    { id: 1, type: "deploy", user: "You", action: "deployed", target: "my-awesome-app", time: "2 hours ago", icon: GitCommit, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { id: 2, type: "setting", user: "You", action: "updated env vars for", target: "my-awesome-app", time: "5 hours ago", icon: Settings, color: "text-sky-400", bg: "bg-sky-400/10" },
    { id: 3, type: "create", user: "You", action: "created project", target: "new-landing-page", time: "1 day ago", icon: Plus, color: "text-white", bg: "bg-white/10" },
    { id: 4, type: "delete", user: "You", action: "deleted project", target: "old-test-app", time: "3 days ago", icon: Trash2, color: "text-red-400", bg: "bg-red-400/10" },
    { id: 5, type: "auth", user: "You", action: "regenerated API token", target: "", time: "1 week ago", icon: Shield, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  return (
    <>
      <Navbar breadcrumbs={[{ label: "Activity" }]} />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight mb-8">Activity Feed</h1>

        <div className="glass-card p-2">
          <div className="divide-y divide-white/[0.04]">
            {activities.map((item) => (
              <div key={item.id} className="p-4 flex items-start gap-4 hover:bg-white/[0.01] transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold text-white">{item.user}</span>{" "}
                    <span className="text-[#888]">{item.action}</span>{" "}
                    {item.target && <span className="font-medium text-[#ccc]">{item.target}</span>}
                  </p>
                  <p className="text-xs text-[#555] mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
