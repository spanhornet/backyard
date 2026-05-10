"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "radix-ui"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/clsx-handler"

function ToastProvider({
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Provider>) {
  return <ToastPrimitive.Provider data-slot="toast-provider" {...props} />
}

function ToastViewport({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "fixed top-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:top-auto sm:max-w-sm",
        className
      )}
      {...props}
    />
  )
}

function Toast({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Root> & {
  variant?: "default" | "destructive"
}) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "bg-background text-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full sm:data-[state=open]:slide-in-from-bottom-full relative flex w-full items-start justify-between gap-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg",
        variant === "destructive" &&
          "border-destructive/50 text-destructive dark:border-destructive [&_[data-slot=toast-description]]:text-destructive/90",
        className
      )}
      {...props}
    />
  )
}

function ToastTitle({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Title>) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Description>) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function ToastClose({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Close>) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      className={cn(
        "text-foreground/50 hover:text-foreground focus:ring-ring absolute top-3 right-3 rounded-sm opacity-70 transition-opacity focus:ring-2 focus:outline-hidden",
        className
      )}
      {...props}
    >
      <XIcon className="size-4" />
      <span className="sr-only">Close</span>
    </ToastPrimitive.Close>
  )
}

export {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
}
