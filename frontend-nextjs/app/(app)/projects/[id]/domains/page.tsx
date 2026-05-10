"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Globe, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function DomainsPage() {
  const handleAdd = () => {
    toast.error("Domain management is read-only in demo mode.");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-1">Domains</h2>
        <p className="text-sm text-[#888]">Manage custom domains for your project. These domains will route traffic to your deployments.</p>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold mb-4">Add Custom Domain</h3>
        <div className="flex gap-3 items-start">
          <Input placeholder="example.com" className="bg-[#0f0f0f] border-white/10 font-mono text-sm max-w-md" />
          <Button onClick={handleAdd} className="bg-white text-black hover:bg-white/90">
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Default domain */}
        <div className="glass-card p-5 border-l-2 border-l-emerald-500 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#ccc]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold font-mono">my-awesome-app.deploykit.app</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded uppercase tracking-wider font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Valid
                </div>
              </div>
              <p className="text-xs text-[#888] mt-1">Default branch: <span className="font-mono text-[#aaa]">main</span></p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild className="h-8 px-3 border-white/10 bg-transparent text-[#bbb] hover:text-white">
              <a href="https://my-awesome-app.deploykit.app" target="_blank">
                Visit <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
