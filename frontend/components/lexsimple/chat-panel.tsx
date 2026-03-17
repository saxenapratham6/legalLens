'use client'

import { useState, FormEvent } from 'react'
import { Sparkles, Scale, CornerDownLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from '@/components/ui/chat-bubble'
import { ChatInput } from '@/components/ui/chat-input'
import { ChatMessageList } from '@/components/ui/chat-message-list'
import type { ChatMessage, DocumentType } from '@/lib/types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatPanelProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  docType?: DocumentType
  isAnalyzing?: boolean
  negotiationMode: boolean
  onToggleNegotiationMode: () => void
}

const starterQuestions: Record<string, string[]> = {
  lease: [
    "What happens if I break the lease early?",
    "Is my security deposit refundable?",
    "Can the landlord change rent mid-lease?",
  ],
  employment_contract: [
    "Can I be fired without cause?",
    "What are my non-compete restrictions?",
    "Is my bonus guaranteed?",
  ],
  NDA: [
    "What information am I not allowed to share?",
    "How long do the restrictions last?",
    "Are there any exceptions?",
  ],
  default: [
    "What are the most important terms?",
    "Are there any unusual clauses?",
    "What should I negotiate?",
  ],
}

export function ChatPanel({ 
  messages, 
  onSendMessage, 
  docType, 
  isAnalyzing,
  negotiationMode,
  onToggleNegotiationMode
}: ChatPanelProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const questions = docType 
    ? starterQuestions[docType] || starterQuestions.default
    : starterQuestions.default

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isAnalyzing) return

    onSendMessage(input.trim())
    setInput('')
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  const handleStarterClick = (question: string) => {
    if (!isAnalyzing) {
      onSendMessage(question)
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
      }, 1500)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as FormEvent)
    }
  }

  return (
    <aside className="fixed right-0 top-0 h-screen w-[320px] bg-[#0f0f0f] border-l border-white/[0.08] flex flex-col z-40">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.08]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-white/60" />
            <h2 className="text-lg font-bold text-white">Ask Legal Lens</h2>
          </div>
          <span className="px-3 py-1 border border-[#76B900]/50 text-[#76B900] text-xs font-semibold rounded-full bg-transparent">
            Nemotron
          </span>
        </div>
        
        {/* Negotiation mode toggle */}
        <button
          onClick={onToggleNegotiationMode}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all border',
            negotiationMode 
              ? 'border-[#76B900]/50 text-white font-semibold' 
              : 'border-white/10 text-white/70 font-medium hover:text-white hover:border-white/25'
          )}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Negotiation Mode
          </span>
          <div className={cn(
            'w-8 h-4 rounded-full relative transition-colors',
            negotiationMode ? 'bg-[#76B900]' : 'bg-white/10'
          )}>
            <div className={cn(
              'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all',
              negotiationMode ? 'left-4' : 'left-0.5'
            )} />
          </div>
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-4 space-y-3">
            <p className="text-white/70 text-sm font-medium">Start a conversation about your document:</p>
            {questions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleStarterClick(question)}
                disabled={isAnalyzing}
                className="w-full text-left px-3 py-2.5 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/25 rounded-lg text-sm text-white/70 font-medium hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {question}
              </button>
            ))}
          </div>
        ) : (
          <ChatMessageList smooth className="h-full">
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                variant={message.role === 'user' ? 'sent' : 'received'}
              >
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  fallback={message.role === 'user' ? 'U' : 'AI'}
                />
                <ChatBubbleMessage
                  variant={message.role === 'user' ? 'sent' : 'received'}
                  className={cn(
                    message.role === 'user' 
                      ? 'bg-[#76B900] text-black font-semibold rounded-2xl rounded-br-sm' 
                      : 'bg-[#1a1a1a] border border-white/10 text-white/80 rounded-2xl rounded-bl-sm'
                  )}
                >
                  {message.role === 'user' ? (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-lg font-bold text-white mt-4 mb-2" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-base font-bold text-white mt-3 mb-2" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-sm font-bold text-white mt-2 mb-1" {...props} />,
                          p: ({node, ...props}) => <p className="text-sm leading-relaxed text-white/80 mb-2" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 mb-2 text-sm" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 mb-2 text-sm" {...props} />,
                          li: ({node, ...props}) => <li className="text-white/80" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                          em: ({node, ...props}) => <em className="italic text-white/90" {...props} />,
                          code: ({node, ...props}: any) => 
                            props.inline 
                              ? <code className="px-1.5 py-0.5 bg-white/10 text-[#76B900] text-xs rounded font-mono" {...props} />
                              : <code className="block px-3 py-2 bg-white/5 text-white/90 text-xs rounded font-mono overflow-x-auto" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#76B900] pl-3 italic text-white/70 my-2" {...props} />,
                          table: ({node, ...props}) => <table className="w-full border-collapse text-xs my-2" {...props} />,
                          th: ({node, ...props}) => <th className="border border-white/20 px-2 py-1 bg-white/5 text-left font-semibold" {...props} />,
                          td: ({node, ...props}) => <td className="border border-white/20 px-2 py-1" {...props} />,
                          hr: ({node, ...props}) => <hr className="border-white/20 my-3" {...props} />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  
                  {/* Clause references */}
                  {message.clauseRefs && message.clauseRefs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-white/10">
                      {message.clauseRefs.map((ref, index) => (
                        <code key={index} className="px-2 py-0.5 bg-white/8 text-white/50 text-xs rounded font-mono">
                          {ref}
                        </code>
                      ))}
                    </div>
                  )}
                </ChatBubbleMessage>
                {/* Disclaimer */}
                {message.role === 'assistant' && (
                  <p className="text-xs text-white/30 italic mt-2">Not legal advice.</p>
                )}
              </ChatBubble>
            ))}

            {isLoading && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  fallback="AI"
                />
                <ChatBubbleMessage isLoading className="bg-[#1a1a1a] border border-white/10 rounded-2xl rounded-bl-sm" />
              </ChatBubble>
            )}
          </ChatMessageList>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/[0.08]">
        <form
          onSubmit={handleSubmit}
          className="relative rounded-xl border border-white/10 bg-[#0f0f0f] focus-within:border-[#76B900]/60 transition-all"
        >
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isAnalyzing ? "Analyzing document..." : "Ask about this document..."}
            disabled={isAnalyzing}
            className="min-h-12 resize-none rounded-xl bg-transparent border-0 p-3 shadow-none focus-visible:ring-0 text-white placeholder:text-white/30"
          />
          <div className="flex items-center p-3 pt-0 justify-end">
            <Button 
              type="submit" 
              size="sm" 
              disabled={!input.trim() || isAnalyzing}
              className="gap-1.5 bg-[#76B900] hover:bg-[#8fd400] text-black font-bold rounded-lg"
            >
              Send
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </aside>
  )
}
