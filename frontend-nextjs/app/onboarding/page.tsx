"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setLoading(true);
      toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
        loading: "Finalizing setup...",
        success: "Welcome to DeployKit!",
        error: "Failed to complete setup"
      });
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden font-sans">
      <div className="dot-grid fixed inset-0 pointer-events-none" />
      <div className="hero-glow fixed inset-0 pointer-events-none opacity-50" />
      
      {/* Minimal Header */}
      <header className="flex justify-center p-6 border-b border-white/[0.05] relative z-10">
        <div className="font-semibold tracking-tight text-lg">DeployKit</div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-lg">
          {/* Progress dots */}
          <div className="flex justify-center gap-3 mb-8">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  step === i ? "bg-white" : step > i ? "bg-emerald-400" : "bg-white/20"
                }`} 
              />
            ))}
          </div>

          <div className="glass-card p-8 min-h-[320px] flex flex-col justify-between shadow-2xl shadow-black/50">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mb-6">
                  <Github className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Connect your first repository</h1>
                <p className="text-[#888] text-sm leading-relaxed max-w-[90%]">
                  To get started, we need access to your GitHub repositories. This allows DeployKit to automatically build and deploy your code whenever you push.
                </p>
                <div className="pt-4">
                  <Button variant="outline" className="border-white/10 bg-transparent hover:bg-white/5 w-full justify-start text-left font-normal text-[#888] cursor-default">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                    Read access to code
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-2xl font-bold tracking-tight mb-2">Configure environment</h1>
                <p className="text-[#888] text-sm leading-relaxed">
                  We detected a React application. We've pre-filled the recommended build settings.
                </p>
                
                <div className="space-y-3 pt-4">
                  <div>
                    <label className="text-xs text-[#555] block mb-1">Build Command</label>
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-lg px-3 py-2.5 font-mono text-sm text-[#ddd]">
                      npm run build
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#555] block mb-1">Output Directory</label>
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-lg px-3 py-2.5 font-mono text-sm text-[#ddd]">
                      dist
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center pt-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">You're all set!</h1>
                <p className="text-[#888] text-sm max-w-[80%] mx-auto">
                  DeployKit is ready to build and serve your applications.
                </p>
              </div>
            )}

            <div className="pt-10 flex justify-end">
              <Button onClick={handleNext} disabled={loading} className="bg-white text-black hover:bg-white/90 px-6 font-medium">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {step === 3 ? "Go to Dashboard" : "Continue"}
                {!loading && step !== 3 && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
