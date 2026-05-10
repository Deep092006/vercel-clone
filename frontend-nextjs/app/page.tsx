"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Github,
  Lock,
  Code2,
  Terminal,
  ArrowRight,
  Play,
  Zap,
  Globe,
  Shield,
  GitBranch,
  Clock,
  ChevronRight,
  Check,
  Star,
  Activity,
  Server,
  Cpu,
} from "lucide-react";
import { Navbar } from "@/components/app/navbar";
import { motion, useInView, AnimatePresence } from "framer-motion";

/* ─── tiny helpers ─────────────────────────────────────────── */

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* animated terminal line */
function TermLine({
  text,
  color = "text-[#ededed]",
  delay = 0,
}: {
  text: string;
  color?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      className={`font-mono text-sm leading-7 ${color}`}
      initial={{ opacity: 0, x: -10 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay, duration: 0.4 }}
    >
      {text}
    </motion.div>
  );
}

/* glowing card */
function GlowCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`group relative rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-6 
      hover:border-white/[0.18] transition-all duration-500 overflow-hidden ${className}`}
    >
      {/* hover glow */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_70%)]" />
      {children}
    </div>
  );
}

/* ─── section: hero ─────────────────────────────────────────── */

function HeroSection({ authenticated }: { authenticated: boolean | null }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 900);
    return () => clearInterval(id);
  }, []);

  const words = ["Instantly.", "Reliably.", "Globally.", "Boldly."];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* ambient bg */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-white/[0.025] rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      {/* badge */}
      <FadeUp delay={0.1}>
        <div className="mb-8 flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-xs text-[#888] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Now in open beta — free for all developers
          <ChevronRight className="w-3 h-3" />
        </div>
      </FadeUp>

      {/* headline */}
      <FadeUp delay={0.2}>
        <h1 className="text-center text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.9] mb-6">
          Deploy Next.js
          <br />
          <AnimatePresence mode="wait">
            <motion.span
              key={tick % words.length}
              className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {words[tick % words.length]}
            </motion.span>
          </AnimatePresence>
        </h1>
      </FadeUp>

      <FadeUp delay={0.35}>
        <p className="text-center text-xl text-[#666] max-w-lg mx-auto mb-10 leading-relaxed">
          Push code. Get a live URL. No config files, no YAML, no cloud console.
          DeployKit handles the rest.
        </p>
      </FadeUp>

      <FadeUp delay={0.5}>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button
            asChild
            className="h-14 px-8 bg-white text-black hover:bg-[#e5e5e5] rounded-full font-semibold text-base transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
          >
            <Link href={authenticated ? "/dashboard" : "/login"}>
              Start Deploying Free <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-14 px-8 bg-transparent border-white/[0.12] text-white hover:bg-white/[0.05] rounded-full font-semibold text-base"
          >
            <Link
              href="https://github.com/your-repo/deploykit"
              target="_blank"
            >
              <Github className="w-4 h-4 mr-2" />
              Star on GitHub
            </Link>
          </Button>
        </div>
      </FadeUp>

      {/* social proof numbers */}
      <FadeUp delay={0.65}>
        <div className="mt-16 flex items-center gap-10 border-t border-white/[0.06] pt-10">
          {[
            { val: "12k+", label: "Developers" },
            { val: "98ms", label: "Avg Deploy Time" },
            { val: "99.9%", label: "Uptime SLA" },
            { val: "40+", label: "Edge Regions" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold tracking-tight">{s.val}</div>
              <div className="text-xs text-[#555] mt-0.5 font-medium">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </FadeUp>

      {/* scroll hint */}
      <motion.div
        className="absolute bottom-8 flex flex-col items-center gap-2 text-[#444] text-xs"
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/20" />
        scroll
      </motion.div>
    </section>
  );
}

/* ─── section: how it works ─────────────────────────────────── */

const HOW_STEPS = [
  {
    icon: Code2,
    num: "01",
    title: "Write your code",
    desc: "Build your Next.js app locally like you always do. No special wrappers or config changes needed.",
    code: [
      { text: "$ npx create-next-app@latest my-app", color: "text-[#888]" },
      { text: "✓ Created project in 3.4s", color: "text-emerald-400" },
      { text: "$ cd my-app && code .", color: "text-[#888]" },
    ],
  },
  {
    icon: GitBranch,
    num: "02",
    title: "Push to GitHub",
    desc: "Connect your repo once. Every push triggers an automatic build — branches, previews, and production.",
    code: [
      { text: "$ git add .", color: "text-[#888]" },
      {
        text: '$ git commit -m "feat: launch page"',
        color: "text-[#888]",
      },
      { text: "$ git push origin main", color: "text-[#888]" },
      {
        text: "→ DeployKit detected push...",
        color: "text-sky-400",
      },
    ],
  },
  {
    icon: Zap,
    num: "03",
    title: "Build & Deploy",
    desc: "Our edge network compiles, optimises, and distributes your app globally in under 30 seconds.",
    code: [
      { text: "📦 Installing dependencies...", color: "text-sky-400" },
      { text: "🔨 Running next build...", color: "text-white" },
      { text: "  ✓ Compiled in 12.4s", color: "text-[#666]" },
      {
        text: "☁️  Pushing to 40 edge nodes...",
        color: "text-violet-400",
      },
      { text: "✅ Live at my-app.deploykit.app", color: "text-emerald-400" },
    ],
  },
];

function HowItWorksSection() {
  return (
    <section className="py-32 px-6 max-w-6xl mx-auto">
      <FadeUp>
        <div className="text-center mb-20">
          <p className="text-xs font-mono text-[#555] tracking-widest uppercase mb-3">
            How it works
          </p>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
            Three steps.
            <br />
            Zero headaches.
          </h2>
        </div>
      </FadeUp>

      <div className="space-y-6">
        {HOW_STEPS.map((step, i) => (
          <FadeUp key={step.num} delay={i * 0.12}>
            <GlowCard className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
              {/* left */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-xs font-mono text-[#333] font-bold">
                    {step.num}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center border border-white/[0.08]">
                    <step.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2">
                  {step.title}
                </h3>
                <p className="text-[#666] leading-relaxed">{step.desc}</p>
              </div>

              {/* right: terminal */}
              <div className="w-full lg:w-[420px] rounded-xl border border-white/[0.06] bg-[#050505] overflow-hidden shrink-0">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.05]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  <span className="ml-3 text-[10px] font-mono text-[#444]">
                    terminal
                  </span>
                </div>
                <div className="p-5 space-y-0.5">
                  {step.code.map((line, j) => (
                    <TermLine
                      key={j}
                      text={line.text}
                      color={line.color}
                      delay={0.1 + j * 0.15}
                    />
                  ))}
                </div>
              </div>
            </GlowCard>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

/* ─── section: features ─────────────────────────────────────── */

const FEATURES = [
  {
    icon: Globe,
    title: "Global Edge Network",
    desc: "40+ PoPs worldwide. Your users hit the closest node every time.",
    tag: "Performance",
  },
  {
    icon: Shield,
    title: "SSL & DDoS Protection",
    desc: "Free wildcard SSL certs auto-renewed. DDoS mitigation built-in.",
    tag: "Security",
  },
  {
    icon: GitBranch,
    title: "Branch Previews",
    desc: "Every pull request gets its own unique preview URL automatically.",
    tag: "Workflow",
  },
  {
    icon: Activity,
    title: "Real-time Analytics",
    desc: "Web vitals, error rates, and traffic — all in one dashboard.",
    tag: "Observability",
  },
  {
    icon: Server,
    title: "Serverless Functions",
    desc: "API routes and server components just work. No extra setup.",
    tag: "Runtime",
  },
  {
    icon: Cpu,
    title: "Build Caching",
    desc: "Smart dependency and output caching slashes rebuild times by 10×.",
    tag: "Speed",
  },
];

function FeaturesSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* bg accent */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <FadeUp>
          <div className="text-center mb-20">
            <p className="text-xs font-mono text-[#555] tracking-widest uppercase mb-3">
              Platform features
            </p>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
              Everything you need.
              <br />
              Nothing you don&apos;t.
            </h2>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.08}>
              <GlowCard className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                    <f.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-mono text-[#444] border border-white/[0.06] rounded-full px-2 py-0.5">
                    {f.tag}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-[#555] text-sm leading-relaxed">{f.desc}</p>
              </GlowCard>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── section: browser preview ──────────────────────────────── */

function BrowserPreviewSection() {
  return (
    <section className="py-32 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row items-center gap-16">
        {/* text */}
        <div className="flex-1">
          <FadeUp>
            <p className="text-xs font-mono text-[#555] tracking-widest uppercase mb-3">
              Result
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-5">
              From push
              <br />
              to live URL.
              <br />
              <span className="text-[#444]">In seconds.</span>
            </h2>
            <p className="text-[#666] leading-relaxed mb-8 max-w-sm">
              Your app lands on our global edge instantly. Share the URL, get
              feedback, ship again — the loop is as tight as you want it.
            </p>

            <ul className="space-y-3">
              {[
                "Automatic HTTPS on every deploy",
                "Custom domain support in one click",
                "Instant rollback to any previous build",
                "Preview links for every branch",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[#888]">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>

        {/* browser mockup */}
        <FadeUp delay={0.2} className="flex-1 w-full">
          <div className="rounded-2xl border border-white/[0.1] bg-[#050505] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
            {/* chrome */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05] bg-[#0a0a0a]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex-1 flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-md px-3 py-1.5 text-xs font-mono text-[#999] max-w-xs mx-auto">
                <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                my-app.deploykit.app
              </div>
              {/* status pill */}
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono border border-emerald-500/20 rounded-full px-2 py-0.5 bg-emerald-500/5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </div>
            </div>

            {/* page content */}
            <div className="h-[360px] bg-white flex flex-col items-center justify-center gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#f8f8f8,#ffffff)]" />
              <div className="relative text-center">
                <h1 className="text-5xl font-black tracking-tighter text-black">
                  Hello World
                </h1>
                <p className="text-[#999] text-sm mt-2">
                  Deployed with DeployKit
                </p>
              </div>
              {/* bottom performance bar */}
              <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-4 py-2 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                <span>200 OK</span>
                <span className="text-emerald-600 font-semibold">12ms TTFB</span>
                <span>Edge: SIN</span>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── section: pricing ──────────────────────────────────────── */

const PLANS = [
  {
    name: "Hobby",
    price: "Free",
    desc: "For personal projects and side experiments.",
    features: [
      "3 Projects",
      "100 GB Bandwidth / mo",
      "Automatic SSL",
      "Community support",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$20",
    period: "/ month",
    desc: "For developers who ship seriously.",
    features: [
      "Unlimited Projects",
      "1 TB Bandwidth / mo",
      "Branch Previews",
      "Custom Domains",
      "Analytics Dashboard",
      "Priority Support",
    ],
    cta: "Start Pro",
    highlight: true,
  },
  {
    name: "Team",
    price: "$60",
    period: "/ month",
    desc: "Collaborate and scale with your whole team.",
    features: [
      "Everything in Pro",
      "5 Team Members",
      "SSO / SAML",
      "Audit Logs",
      "SLA 99.99%",
      "Dedicated Support",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

function PricingSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="max-w-5xl mx-auto">
        <FadeUp>
          <div className="text-center mb-20">
            <p className="text-xs font-mono text-[#555] tracking-widest uppercase mb-3">
              Pricing
            </p>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
              Simple pricing.
              <br />
              Serious scale.
            </h2>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan, i) => (
            <FadeUp key={plan.name} delay={i * 0.1}>
              <div
                className={`relative h-full rounded-2xl border p-8 transition-all duration-300 ${
                  plan.highlight
                    ? "border-white/30 bg-white text-black shadow-[0_0_60px_rgba(255,255,255,0.1)]"
                    : "border-white/[0.08] bg-[#0a0a0a]"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-black text-white text-[10px] font-bold px-3 py-1 border border-white/20">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <p
                    className={`text-xs font-mono tracking-widest uppercase mb-2 ${plan.highlight ? "text-[#555]" : "text-[#444]"}`}
                  >
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-extrabold tracking-tighter">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span
                        className={`text-sm mb-1.5 ${plan.highlight ? "text-[#666]" : "text-[#444]"}`}
                      >
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm ${plan.highlight ? "text-[#666]" : "text-[#555]"}`}
                  >
                    {plan.desc}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check
                        className={`w-4 h-4 shrink-0 ${plan.highlight ? "text-black" : "text-emerald-400"}`}
                      />
                      <span className={plan.highlight ? "text-[#333]" : "text-[#777]"}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full h-11 rounded-xl font-semibold text-sm ${
                    plan.highlight
                      ? "bg-black text-white hover:bg-[#111]"
                      : "bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.08]"
                  }`}
                >
                  {plan.cta}
                </Button>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── section: CTA ──────────────────────────────────────────── */

function CTASection({ authenticated }: { authenticated: boolean | null }) {
  return (
    <section className="py-40 px-6 text-center relative overflow-hidden">
      {/* ambient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-white/[0.03] rounded-full blur-[100px]" />
      </div>

      <FadeUp>
        <p className="text-xs font-mono text-[#555] tracking-widest uppercase mb-4">
          Ready?
        </p>
        <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6">
          Your turn.
        </h2>
        <p className="text-xl text-[#555] max-w-md mx-auto mb-12 leading-relaxed">
          Join 12,000+ developers who stopped wrestling with infrastructure.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            className="h-14 px-10 bg-white text-black hover:bg-[#e5e5e5] rounded-full font-semibold text-base transition-all hover:scale-105 shadow-[0_0_60px_rgba(255,255,255,0.2)]"
          >
            <Link href={authenticated ? "/dashboard" : "/login"}>
              Get started for free <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-14 px-8 bg-transparent border-white/[0.12] text-white hover:bg-white/[0.05] rounded-full font-semibold text-base"
          >
            <Link href="https://github.com/your-repo/deploykit" target="_blank">
              <Github className="w-4 h-4 mr-2" />
              <Star className="w-3 h-3 mr-1 text-yellow-400 fill-yellow-400" />
              Star on GitHub
            </Link>
          </Button>
        </div>
      </FadeUp>
    </section>
  );
}

/* ─── footer ────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-black py-14 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
          {/* brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
                <svg
                  viewBox="0 0 76 65"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-black w-4 h-4"
                >
                  <path
                    d="M37.5274 0L75.0548 65H0L37.5274 0Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="font-bold tracking-tighter text-xl">
                DeployKit
              </span>
            </div>
            <p className="text-sm text-[#444] max-w-[200px] leading-relaxed">
              The fastest way to ship Next.js apps.
            </p>
          </div>

          {/* links */}
          {[
            {
              heading: "Product",
              links: ["Dashboard", "Docs", "Changelog", "Status"],
            },
            {
              heading: "Company",
              links: ["About", "Blog", "Careers", "Press"],
            },
            {
              heading: "Legal",
              links: ["Privacy", "Terms", "Security", "Cookies"],
            },
          ].map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold text-[#333] tracking-widest uppercase mb-4">
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link
                      href="#"
                      className="text-sm text-[#555] hover:text-white transition-colors"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.05] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#333]">
          <span>© 2025 DeployKit, Inc. All rights reserved.</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── root page ─────────────────────────────────────────────── */

export default function LandingPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((data) => setAuthenticated(Boolean(data?.authenticated)))
      .catch(() => setAuthenticated(false));
  }, []);

  return (
    <div className="bg-black text-[#ededed] font-sans selection:bg-white/20 antialiased">
      <Navbar />
      <HeroSection authenticated={authenticated} />
      <HowItWorksSection />
      <FeaturesSection />
      <BrowserPreviewSection />
      <PricingSection />
      <CTASection authenticated={authenticated} />
      <Footer />
    </div>
  );
}