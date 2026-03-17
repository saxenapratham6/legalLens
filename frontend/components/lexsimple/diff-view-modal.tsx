'use client'

import { X, Copy, Check, FileDown, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { DraftProposal, Severity } from '@/lib/types'

interface DiffViewModalProps {
  isOpen: boolean
  onClose: () => void
  proposal: DraftProposal | null
  onApply: () => void
}

function SeverityBadge({ severity, label }: { severity: Severity; label: string }) {
  return (
    <span className={cn(
      'px-2 py-0.5 rounded-md text-xs font-semibold border',
      severity === 'RED' && 'bg-red-500/15 text-red-400 border-red-500/30',
      severity === 'AMBER' && 'bg-amber-400/15 text-amber-300 border-amber-400/30',
      severity === 'GREEN' && 'bg-[#76B900]/15 text-[#76B900] border-[#76B900]/30'
    )}>
      {label}
    </span>
  )
}

export function DiffViewModal({ isOpen, onClose, proposal, onApply }: DiffViewModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !proposal) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(proposal.proposed)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#76B900]" />
            <div>
              <h2 className="text-lg font-bold text-white">Draft Generator</h2>
              <p className="text-xs font-mono text-[#76B900]">Nemotron Super 120b</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[calc(90vh-180px)] overflow-y-auto">
          {/* Side-by-side diff */}
          <div className="grid grid-cols-2 gap-4">
            {/* Original */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 rounded-t-lg border border-red-500/30">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm font-semibold text-red-400">Original</span>
              </div>
              <div className="p-4 bg-[#141414] border border-white/10 rounded-b-lg min-h-[200px]">
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                  {proposal.original}
                </p>
              </div>
            </div>

            {/* Proposed */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#76B900]/10 rounded-t-lg border border-[#76B900]/30">
                <div className="w-3 h-3 rounded-full bg-[#76B900]" />
                <span className="text-sm font-semibold text-[#76B900]">Proposed</span>
              </div>
              <div className="p-4 bg-[#141414] border border-white/10 rounded-b-lg min-h-[200px]">
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                  {proposal.proposed}
                </p>
              </div>
            </div>
          </div>

          {/* Change summary */}
          <div className="p-4 bg-[#141414] border border-white/10 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-2">Change Summary</h3>
            <p className="text-sm text-white/70">{proposal.changeSummary}</p>
          </div>

          {/* Risk delta */}
          <div className="flex items-center gap-4 p-4 bg-[#141414] border border-white/10 rounded-lg">
            <span className="text-sm font-semibold text-white/70">Risk Delta:</span>
            <div className="flex items-center gap-2">
              <SeverityBadge severity={proposal.riskDelta.before} label="Before" />
              <span className="text-white/30">→</span>
              <SeverityBadge severity={proposal.riskDelta.after} label="After" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-white/[0.08] bg-[#0a0a0a]">
          <p className="text-xs text-white/40 font-medium">
            Review the proposed changes before applying to your document.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/25 rounded-lg transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#76B900]" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Revised Clause
                </>
              )}
            </button>
            <button
              onClick={onApply}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#76B900] hover:bg-[#8fd400] text-black font-bold text-sm rounded-lg transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Apply to Document
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
