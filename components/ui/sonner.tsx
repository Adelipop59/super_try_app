"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  XCircleIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <XCircleIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          error: 'group-[.toaster]:bg-destructive/10 group-[.toaster]:text-destructive group-[.toaster]:border-destructive/30 dark:group-[.toaster]:bg-destructive/20 dark:group-[.toaster]:border-destructive/40',
          success: 'group-[.toaster]:bg-emerald-50 group-[.toaster]:text-emerald-700 group-[.toaster]:border-emerald-200 dark:group-[.toaster]:bg-emerald-950/50 dark:group-[.toaster]:text-emerald-400 dark:group-[.toaster]:border-emerald-800',
          warning: 'group-[.toaster]:bg-amber-50 group-[.toaster]:text-amber-700 group-[.toaster]:border-amber-200 dark:group-[.toaster]:bg-amber-950/50 dark:group-[.toaster]:text-amber-400 dark:group-[.toaster]:border-amber-800',
          info: 'group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-700 group-[.toaster]:border-blue-200 dark:group-[.toaster]:bg-blue-950/50 dark:group-[.toaster]:text-blue-400 dark:group-[.toaster]:border-blue-800',
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
