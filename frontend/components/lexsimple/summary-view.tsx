'use client'

import { useState } from 'react'
import { ChevronDown, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Section } from '@/lib/types'

interface SummaryViewProps {
  sections: Section[]
}

function SectionAccordion({ section }: { section: Section }) {
  const [isOpen, setIsOpen] = useState(true)
  const [showOriginal, setShowOriginal] = useState(false)

  const gradeColor = section.readingGrade 
    ? section.readingGrade <= 8 
      ? 'bg-[#76B900]/15 text-[#76B900] border border-[#76B900]/30' 
      : section.readingGrade <= 12 
        ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
        : 'bg-red-500/15 text-red-400 border border-red-500/30'
    : 'bg-white/8 text-white/70 border border-white/15'

  return (
    <div className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden hover:border-white/25 transition-colors">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <ChevronDown className={cn(
            'w-5 h-5 text-white/40 transition-transform',
            !isOpen && '-rotate-90'
          )} />
          <h4 className="text-base font-bold text-white leading-snug">{section.title}</h4>
          {section.hasAmbiguity && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-400/10 text-amber-300 border border-amber-400/25 text-xs rounded-md font-semibold">
              <AlertTriangle className="w-3 h-3" />
              Vague
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {section.readingGrade && (
            <span className={cn('px-2 py-0.5 rounded-md text-xs font-semibold', gradeColor)}>
              Grade {section.readingGrade}
            </span>
          )}
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-5 pb-5 border-t border-white/[0.08]">
          {/* Toggle */}
          <div className="flex items-center justify-end gap-2 py-3">
            <span className={cn('text-xs font-medium', !showOriginal ? 'text-[#76B900]' : 'text-white/40')}>
              Simplified
            </span>
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="relative w-10 h-5 rounded-full bg-white/10 transition-colors"
            >
              <div className={cn(
                'absolute top-0.5 w-4 h-4 rounded-full bg-[#76B900] transition-all',
                showOriginal ? 'left-5' : 'left-0.5'
              )} />
            </button>
            <span className={cn('text-xs font-medium', showOriginal ? 'text-[#76B900]' : 'text-white/40')}>
              Original
            </span>
          </div>

          {/* Text content */}
          <div className={cn(
            'p-4 rounded-lg text-sm leading-relaxed border',
            showOriginal 
              ? 'bg-white/[0.02] border-white/[0.08] text-white/50 font-mono text-xs' 
              : 'bg-white/[0.02] border-white/[0.08] text-white/70'
          )}>
            {showOriginal ? section.original : section.simplified}
          </div>
        </div>
      )}
    </div>
  )
}

export function SummaryView({ sections }: SummaryViewProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-white">Plain-Language Summary ({sections.length} sections)</h3>
      <div className="space-y-3">
        {sections.map(section => (
          <SectionAccordion key={section.id} section={section} />
        ))}
      </div>
    </div>
  )
}
