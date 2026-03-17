"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface ChatInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, ...props }, ref) => (
    <Textarea
      autoComplete="off"
      ref={ref}
      name="message"
      className={cn(
        "max-h-12 px-4 py-3 bg-[#111827] text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#76B900] disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-lg flex items-center h-16 resize-none border-[#1e2d45]",
        className,
      )}
      {...props}
    />
  ),
)
ChatInput.displayName = "ChatInput"

export { ChatInput }
