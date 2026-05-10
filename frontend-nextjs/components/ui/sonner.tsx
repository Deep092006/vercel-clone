"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#111] group-[.toaster]:text-white group-[.toaster]:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
          description: "group-[.toast]:text-[#888]",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-black",
          cancelButton:
            "group-[.toast]:bg-[#333] group-[.toast]:text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
