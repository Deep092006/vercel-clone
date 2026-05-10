"use client";

import { Navbar } from "@/components/app/navbar";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle2, ArrowUpRight } from "lucide-react";

export default function BillingPage() {
  const usageItems = [
    { label: "Build Minutes", used: 47, limit: 6000, unit: "min", pct: 0.78 },
    { label: "Bandwidth", used: 482, limit: 1000, unit: "GB", pct: 48.2 },
    { label: "Storage", used: 128, limit: 1024, unit: "MB", pct: 12.5 },
    { label: "Serverless Invocations", used: 12400, limit: 100000, unit: "", pct: 12.4 },
  ];

  const invoices = [
    { date: "May 2026", amount: "$0.00", status: "Current", plan: "Hobby" },
    { date: "Apr 2026", amount: "$0.00", status: "Paid", plan: "Hobby" },
    { date: "Mar 2026", amount: "$0.00", status: "Paid", plan: "Hobby" },
  ];

  return (
    <>
      <Navbar breadcrumbs={[{ label: "Usage & Billing" }]} />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-10">Usage & Billing</h1>

        <div className="space-y-10">
          {/* ── PLAN CARD ──────────────────────────────────────────────── */}
          <div className="grid lg:grid-cols-[1fr_auto] gap-6">
            <div className="glass-card p-8 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold">Hobby Plan</h2>
                  <span className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full font-medium">Active</span>
                </div>
                <p className="text-[15px] text-[#888] max-w-lg mb-6">
                  Perfect for personal projects and experiments. Upgrade to Pro for more build minutes, bandwidth, and team collaboration.
                </p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-bold tracking-tight">$0</span>
                  <span className="text-lg text-[#888]">/month</span>
                </div>
                <ul className="space-y-2.5 text-[15px] text-[#ccc]">
                  {["100 deployments/month", "1 GB storage", "100 GB bandwidth", "Community support"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-emerald-500/[0.03] rounded-full blur-3xl" />
            </div>

            <div className="glass-card p-8 flex flex-col items-center justify-center text-center min-w-[280px] relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-7 h-7 text-violet-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Upgrade to Pro</h3>
                <p className="text-sm text-[#888] mb-6 max-w-[200px]">Unlimited builds, team features, and priority support.</p>
                <Button className="w-full h-11 bg-white text-black hover:bg-white/90 rounded-xl font-medium text-[15px]">
                  Upgrade <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-violet-500/[0.04] rounded-full blur-3xl" />
            </div>
          </div>

          {/* ── USAGE METERS ────────────────────────────────────────────── */}
          <section>
            <h2 className="section-header mb-5">Current Period Usage</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {usageItems.map((item, i) => (
                <div key={i} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[15px] font-medium">{item.label}</p>
                    <p className="text-sm text-[#888] font-mono tabular-nums">
                      {item.used.toLocaleString()}{item.unit ? ` ${item.unit}` : ""} / {item.limit.toLocaleString()}{item.unit ? ` ${item.unit}` : ""}
                    </p>
                  </div>
                  <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${item.pct}%`,
                        background: item.pct > 80 ? "#ef4444" : item.pct > 50 ? "#f59e0b" : "#34d399",
                      }}
                    />
                  </div>
                  <p className="text-xs text-[#666] mt-2">{item.pct.toFixed(1)}% used</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── BILLING HISTORY ───────────────────────────────────────── */}
          <section>
            <h2 className="section-header mb-5">Billing History</h2>
            <div className="glass-card overflow-hidden">
              <table className="w-full text-[15px]">
                <thead className="bg-white/[0.02]">
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-6 py-4 text-[#888] font-medium">Period</th>
                    <th className="text-left px-6 py-4 text-[#888] font-medium">Plan</th>
                    <th className="text-left px-6 py-4 text-[#888] font-medium">Status</th>
                    <th className="text-right px-6 py-4 text-[#888] font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {invoices.map((inv, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium">{inv.date}</td>
                      <td className="px-6 py-4 text-[#888]">{inv.plan}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm px-2.5 py-1 rounded-full font-medium ${
                          inv.status === "Current" ? "text-sky-400 bg-sky-400/10" : "text-emerald-400 bg-emerald-400/10"
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono tabular-nums">{inv.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
