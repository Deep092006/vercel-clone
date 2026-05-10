"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ProjectSettingsPage() {
  const handleSave = () => {
    toast.success("Project settings saved successfully.");
  };

  const handleDelete = () => {
    toast.error("Project deletion is disabled in demo mode.");
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <section>
        <h2 className="text-lg font-semibold tracking-tight mb-4">General Settings</h2>
        <div className="glass-card p-6 space-y-6">
          <div className="grid sm:grid-cols-[200px_1fr] gap-4 items-start">
            <div className="pt-2">
              <p className="text-sm font-medium">Project Name</p>
              <p className="text-xs text-[#888] mt-1">The name of your project.</p>
            </div>
            <Input defaultValue="my-awesome-app" className="bg-[#0f0f0f] border-white/10" />
          </div>

          <div className="grid sm:grid-cols-[200px_1fr] gap-4 items-start">
            <div className="pt-2">
              <p className="text-sm font-medium">Build Command</p>
              <p className="text-xs text-[#888] mt-1">Command to build the app.</p>
            </div>
            <Input defaultValue="npm run build" className="bg-[#0f0f0f] border-white/10 font-mono text-sm" />
          </div>

          <div className="grid sm:grid-cols-[200px_1fr] gap-4 items-start">
            <div className="pt-2">
              <p className="text-sm font-medium">Output Directory</p>
              <p className="text-xs text-[#888] mt-1">Directory containing the compiled assets.</p>
            </div>
            <Input defaultValue="dist" className="bg-[#0f0f0f] border-white/10 font-mono text-sm" />
          </div>

          <div className="pt-4 border-t border-white/[0.05] flex justify-end">
            <Button onClick={handleSave} className="bg-white text-black hover:bg-white/90">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Git Integration</h2>
        <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center flex-shrink-0">
              <Github className="w-6 h-6 text-[#ccc]" />
            </div>
            <div>
              <p className="text-sm font-semibold">Connected Repository</p>
              <p className="text-xs text-[#888] mt-1 font-mono break-all">owner/my-awesome-app</p>
            </div>
          </div>
          <Button variant="outline" className="border-white/10 bg-transparent text-[#888] hover:text-white hover:bg-white/5">
            Disconnect
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-tight text-red-500/80 mb-4">Danger Zone</h2>
        <div className="glass-card p-6 border-red-500/20 bg-red-500/[0.02]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-semibold text-sm text-red-400 mb-1">Delete Project</h3>
              <p className="text-xs text-red-400/70 max-w-md">
                Permanently delete this project and all its deployments. This action cannot be undone.
              </p>
            </div>
            <Button onClick={handleDelete} variant="destructive" className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 whitespace-nowrap">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Project
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
