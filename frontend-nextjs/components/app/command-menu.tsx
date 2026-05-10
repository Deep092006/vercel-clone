"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Monitor, Settings, Layout, Plus, Activity, GitCommit } from "lucide-react";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setSearch("");
    }
  }, [open]);

  if (!open) return null;

  const items = [
    { label: "Create Project", icon: Plus, href: "/projects/new", group: "Projects" },
    { label: "Go to Dashboard", icon: Layout, href: "/dashboard", group: "Projects" },
    { label: "Settings", icon: Settings, href: "/settings", group: "Account" },
    { label: "Activity", icon: Activity, href: "/activity", group: "Account" },
  ];

  const filtered = items.filter(i => i.label.toLowerCase().includes(search.toLowerCase()));

  const runCommand = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setOpen(false)}
      />
      
      {/* Dialog */}
      <div className="relative w-full max-w-[600px] bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center px-4 border-b border-white/[0.08]">
          <Search className="w-5 h-5 text-[#666]" />
          <input
            ref={inputRef}
            className="flex-1 h-14 bg-transparent border-none outline-none text-white px-3 placeholder-[#666] text-lg"
            placeholder="Type a command or search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "Enter" && filtered.length > 0) runCommand(filtered[0].href);
            }}
          />
          <div className="text-[10px] text-[#666] border border-white/10 rounded px-1.5 py-0.5 font-mono">
            ESC
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#666]">
              No results found.
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-2 py-1.5 text-xs font-semibold text-[#888] uppercase tracking-wider">
                Suggestions
              </div>
              {filtered.map((item, i) => (
                <button
                  key={i}
                  onClick={() => runCommand(item.href)}
                  className="w-full flex items-center px-3 py-3 text-sm text-[#ccc] hover:bg-white/[0.04] hover:text-white rounded-xl transition-colors focus:bg-white/[0.04] focus:text-white outline-none"
                >
                  <item.icon className="w-4 h-4 mr-3 text-[#888]" />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="px-4 py-3 bg-[#141414] border-t border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-[#888]">
              <span className="bg-white/10 px-1.5 rounded">↑</span>
              <span className="bg-white/10 px-1.5 rounded">↓</span>
              <span>to navigate</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#888]">
              <span className="bg-white/10 px-1.5 rounded">↵</span>
              <span>to select</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
