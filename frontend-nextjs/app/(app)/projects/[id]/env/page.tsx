"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Plus, Trash2, Eye, EyeOff, Lock, Upload } from "lucide-react";
import { toast } from "sonner";

type EnvVar = { id: number; key: string; value: string; scope: string };

export default function EnvVarsPage() {
  const [scope, setScope] = useState<"production"|"preview"|"development">("production");
  const [vars, setVars] = useState<EnvVar[]>([
    { id: 1, key: "NODE_ENV", value: "production", scope: "production" },
    { id: 2, key: "API_URL", value: "https://api.example.com", scope: "production" },
    { id: 3, key: "DATABASE_URL", value: "postgresql://user:pass@host:5432/db", scope: "production" },
    { id: 4, key: "API_URL", value: "https://staging-api.example.com", scope: "preview" },
    { id: 5, key: "DEBUG", value: "true", scope: "development" },
  ]);
  const [show, setShow] = useState<Record<number,boolean>>({});
  const filtered = vars.filter(v => v.scope === scope);
  const toggle = (id: number) => setShow(p => ({...p, [id]: !p[id]}));
  const copy = (v: string) => { navigator.clipboard.writeText(v); toast.success("Copied"); };
  const remove = (id: number) => { setVars(vars.filter(v=>v.id!==id)); toast.success("Removed"); };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-1">Environment Variables</h2>
        <p className="text-[15px] text-[#888]">Securely injected during build and runtime.</p>
      </div>
      <div className="flex gap-1 bg-white/[0.03] border border-white/[0.08] rounded-xl p-1 w-fit">
        {(["production","preview","development"] as const).map(s=>(
          <button key={s} onClick={()=>setScope(s)} className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all capitalize ${scope===s?"bg-white text-black":"text-[#888] hover:text-white hover:bg-white/[0.05]"}`}>{s}</button>
        ))}
      </div>
      <div className="glass-card p-6">
        <h3 className="text-[15px] font-semibold mb-4">Add New Variable</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input placeholder="KEY" className="flex-1 bg-[#0f0f0f] border-white/10 font-mono text-[15px] uppercase h-11 rounded-xl" />
          <Input placeholder="VALUE" type="password" className="flex-[2] bg-[#0f0f0f] border-white/10 font-mono text-[15px] h-11 rounded-xl" />
          <Button className="bg-white text-black hover:bg-white/90 h-11 px-5 rounded-xl"><Plus className="w-4 h-4 mr-2"/>Add</Button>
        </div>
      </div>
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.01] flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#888]" />
          <span className="text-sm font-semibold text-[#bbb]">Inherited from Team</span>
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-white/[0.01]">
          <div><p className="font-mono text-[15px] text-[#ccc]">TEAM_API_KEY</p><p className="text-sm text-[#555] font-mono mt-1">••••••••••••</p></div>
          <Lock className="w-4 h-4 text-[#555]" />
        </div>
      </div>
      <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f0f] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.08] bg-[#141414] flex justify-between">
          <h3 className="text-[15px] font-semibold capitalize">{scope} Variables</h3>
          <span className="text-sm text-[#888] font-mono">{filtered.length}</span>
        </div>
        {filtered.length===0?(
          <div className="p-10 text-center"><p className="text-[15px] text-[#888]">No variables for this scope.</p></div>
        ):(
          <div className="divide-y divide-white/[0.04]">
            {filtered.map(v=>(
              <div key={v.id} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-white/[0.01] transition-colors">
                <div className="flex-1 min-w-0"><p className="text-[15px] font-mono text-[#eee] truncate mb-2">{v.key}</p>
                  <div className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 font-mono text-sm max-w-lg">
                    <span className={show[v.id]?"text-white":"text-[#555]"}>{show[v.id]?v.value:"••••••••••••••••"}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={()=>toggle(v.id)} className="h-9 w-9 p-0 text-[#888] hover:text-white rounded-xl">{show[v.id]?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</Button>
                  <Button variant="ghost" size="sm" onClick={()=>copy(v.value)} className="h-9 w-9 p-0 text-[#888] hover:text-white rounded-xl"><Copy className="w-4 h-4"/></Button>
                  <Button variant="ghost" size="sm" onClick={()=>remove(v.id)} className="h-9 w-9 p-0 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-xl"><Trash2 className="w-4 h-4"/></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
