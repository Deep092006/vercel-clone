import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <h1 className="text-8xl font-bold tracking-tighter bg-gradient-to-br from-white to-[#555] bg-clip-text text-transparent mb-6">
        404
      </h1>
      <h2 className="text-xl font-semibold mb-2">Page not found</h2>
      <p className="text-sm text-[#888] mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="h-10 px-6 bg-white text-black hover:bg-white/90 rounded-xl font-medium">
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  );
}
