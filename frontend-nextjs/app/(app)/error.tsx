"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-sm text-[#888] mb-8 max-w-md">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} className="h-10 px-6 bg-white text-black hover:bg-white/90 rounded-xl font-medium">
          Try again
        </Button>
        <Button asChild variant="outline" className="h-10 px-6 border-white/10 text-white hover:bg-white/5 rounded-xl font-medium bg-transparent">
          <a href="/dashboard">Go Home</a>
        </Button>
      </div>
    </div>
  );
}
