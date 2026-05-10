import { Toaster } from "@/components/ui/sonner"
import { CommandMenu } from "@/components/app/command-menu"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="dot-grid fixed inset-0 pointer-events-none" />
      <div className="relative">
        {children}
      </div>
      <CommandMenu />
      <Toaster />
    </div>
  )
}
