"use client";

import { useMemo, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, TooltipProps,
} from "recharts";
import { TrendingUp, Users, BarChart3, Clock, Gauge } from "lucide-react";

// ── Seeded random for consistent mock data ──────────────────────────
function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function generateVisitorData(days: number) {
  const rand = seededRandom(42);
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const base = 800 + Math.sin(i * 0.3) * 400;
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      visitors: Math.round(base + rand() * 600),
      pageViews: Math.round((base + rand() * 600) * (2 + rand())),
    });
  }
  return data;
}

function generateRequestData(days: number) {
  const rand = seededRandom(99);
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      requests: Math.round(2000 + rand() * 4000 + Math.sin(i * 0.5) * 1000),
    });
  }
  return data;
}

// ── Custom Tooltip ──────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-sm text-[#888] mb-2 font-medium">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-[#999] capitalize">{entry.name}:</span>
          <span className="font-semibold text-white">{entry.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

type Period = "24h" | "7d" | "30d" | "90d";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");

  const days = period === "24h" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const visitorData = useMemo(() => generateVisitorData(days), [days]);
  const requestData = useMemo(() => generateRequestData(days), [days]);

  const totalVisitors = visitorData.reduce((a, b) => a + b.visitors, 0);
  const totalPageViews = visitorData.reduce((a, b) => a + b.pageViews, 0);
  const totalRequests = requestData.reduce((a, b) => a + b.requests, 0);
  const avgLatency = 48 + Math.round(days * 0.7);

  const topPages = [
    { path: "/", views: 12847, uniques: 8234, bounce: "32%" },
    { path: "/about", views: 4521, uniques: 3102, bounce: "45%" },
    { path: "/pricing", views: 3890, uniques: 2456, bounce: "38%" },
    { path: "/blog/getting-started", views: 2341, uniques: 1987, bounce: "28%" },
    { path: "/docs/api", views: 1876, uniques: 1234, bounce: "22%" },
  ];

  const webVitals = [
    { name: "LCP", value: 1.8, unit: "s", target: 2.5, color: "#34d399", label: "Good" },
    { name: "FID", value: 12, unit: "ms", target: 100, color: "#34d399", label: "Good" },
    { name: "CLS", value: 0.05, unit: "", target: 0.1, color: "#34d399", label: "Good" },
    { name: "TTFB", value: 180, unit: "ms", target: 800, color: "#34d399", label: "Good" },
  ];

  return (
    <div className="space-y-8">
      {/* ── HEADER + PERIOD SELECTOR ──────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight mb-1">Analytics</h2>
          <p className="text-[15px] text-[#888]">Traffic and performance metrics.</p>
        </div>
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] rounded-xl p-1">
          {(["24h", "7d", "30d", "90d"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                period === p
                  ? "bg-white text-black"
                  : "text-[#888] hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── STAT CARDS ────────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: totalRequests.toLocaleString(), trend: "+12.3%", icon: TrendingUp, trendUp: true },
          { label: "Unique Visitors", value: totalVisitors.toLocaleString(), trend: "+5.4%", icon: Users, trendUp: true },
          { label: "Page Views", value: totalPageViews.toLocaleString(), trend: "+8.1%", icon: BarChart3, trendUp: true },
          { label: "Avg. Latency", value: `${avgLatency}ms`, trend: "-3ms", icon: Clock, trendUp: false },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3 relative z-10">
              <p className="text-sm text-[#888] font-medium">{stat.label}</p>
              <stat.icon className="w-4.5 h-4.5 text-[#555] group-hover:text-white transition-colors" />
            </div>
            <div className="flex items-baseline gap-2.5 relative z-10">
              <p className="stat-value">{stat.value}</p>
              <span className={`text-sm font-medium ${stat.trendUp ? "text-emerald-400" : "text-sky-400"}`}>
                {stat.trend}
              </span>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/[0.015] rounded-full blur-xl group-hover:bg-white/[0.04] transition-colors" />
          </div>
        ))}
      </div>

      {/* ── VISITORS AREA CHART ────────────────────────────────────── */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-1">Visitors & Page Views</h3>
        <p className="text-sm text-[#888] mb-6">Unique visitors and total page views over time.</p>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visitorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pageViewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="pageViews" stroke="#38bdf8" strokeWidth={2} fill="url(#pageViewsGrad)" name="Page Views" />
              <Area type="monotone" dataKey="visitors" stroke="#34d399" strokeWidth={2} fill="url(#visitorsGrad)" name="Visitors" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── REQUESTS BAR CHART ─────────────────────────────────────── */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-1">Request Volume</h3>
        <p className="text-sm text-[#888] mb-6">Daily API and page requests.</p>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={requestData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="requests" fill="rgba(120,119,198,0.6)" radius={[4, 4, 0, 0]} name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── TOP PAGES TABLE ─────────────────────────────────────────── */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.06]">
            <h3 className="text-lg font-semibold">Top Pages</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02]">
              <tr className="border-b border-white/[0.05]">
                <th className="text-left px-6 py-3 text-[#888] font-medium">Path</th>
                <th className="text-right px-6 py-3 text-[#888] font-medium">Views</th>
                <th className="text-right px-6 py-3 text-[#888] font-medium">Uniques</th>
                <th className="text-right px-6 py-3 text-[#888] font-medium">Bounce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {topPages.map((page, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3.5 font-mono text-[13px] text-white">{page.path}</td>
                  <td className="px-6 py-3.5 text-right text-[#ccc] tabular-nums">{page.views.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-right text-[#ccc] tabular-nums">{page.uniques.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-right text-[#888]">{page.bounce}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── WEB VITALS ─────────────────────────────────────────────── */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Web Vitals</h3>
              <p className="text-sm text-[#888] mt-1">Core performance metrics.</p>
            </div>
            <Gauge className="w-5 h-5 text-[#555]" />
          </div>
          <div className="space-y-5">
            {webVitals.map((vital) => {
              const pct = Math.min((vital.value / vital.target) * 100, 100);
              return (
                <div key={vital.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[15px] font-semibold">{vital.name}</span>
                      <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-medium">{vital.label}</span>
                    </div>
                    <span className="text-[15px] font-mono tabular-nums text-white">
                      {vital.value}{vital.unit}
                    </span>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${pct}%`, background: vital.color }}
                    />
                  </div>
                  <p className="text-xs text-[#666] mt-1">Target: &lt;{vital.target}{vital.unit}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
