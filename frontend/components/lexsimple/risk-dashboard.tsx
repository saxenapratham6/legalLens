'use client'

import { AlertTriangle, AlertCircle, CheckCircle, ChevronRight, Lightbulb, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RiskFlag, AnalysisReport, Severity } from '@/lib/types'

interface RiskDashboardProps {
  report: AnalysisReport
  onExplainMore: (flag: RiskFlag) => void
  onSuggestFix: (flag: RiskFlag) => void
  onNewDocument?: () => void
}

function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={cn(
      'px-2 py-0.5 rounded-md text-xs font-semibold border',
      severity === 'RED' && 'bg-red-500/15 text-red-400 border-red-500/30',
      severity === 'AMBER' && 'bg-amber-400/15 text-amber-300 border-amber-400/30',
      severity === 'GREEN' && 'bg-[#76B900]/15 text-[#76B900] border-[#76B900]/30'
    )}>
      {severity}
    </span>
  )
}

function StatCard({ 
  severity, 
  count, 
  label, 
  subtitle 
}: { 
  severity: Severity
  count: number
  label: string
  subtitle: string
}) {
  return (
    <div className="bg-[#141414] border border-white/10 rounded-xl p-5">
      <span className={cn(
        'text-6xl font-black',
        severity === 'RED' && 'text-red-400',
        severity === 'AMBER' && 'text-amber-300',
        severity === 'GREEN' && 'text-[#76B900]'
      )}>
        {count}
      </span>
      <h3 className="text-white font-semibold mt-2">{label}</h3>
      <p className="text-white/50 text-sm">{subtitle}</p>
    </div>
  )
}

function RiskScoreDial({ score }: { score: number }) {
  const scoreColor = score >= 7 ? 'text-red-400' : score >= 4 ? 'text-amber-300' : 'text-[#76B900]'
  const riskLevel = score >= 7 ? 'High Risk' : score >= 4 ? 'Medium Risk' : 'Low Risk'
  
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 10) * circumference
  
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={score >= 7 ? '#ef4444' : score >= 4 ? '#fbbf24' : '#76B900'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-3xl font-black', scoreColor)}>{score.toFixed(1)}</span>
          <span className="text-white/40 text-sm">/10</span>
        </div>
      </div>
      <div>
        <p className={cn('text-lg font-bold', scoreColor)}>{riskLevel}</p>
        <p className="text-white/50 text-sm font-medium">Overall Score</p>
      </div>
    </div>
  )
}

function RiskFlagCard({ 
  flag, 
  onExplainMore, 
  onSuggestFix 
}: { 
  flag: RiskFlag
  onExplainMore: () => void
  onSuggestFix: () => void
}) {
  return (
    <div className={cn(
      'bg-[#141414] border border-white/10 rounded-xl p-5 hover:border-white/25 hover:bg-[#1a1a1a] transition-all border-l-4',
      flag.severity === 'RED' && 'border-l-red-500',
      flag.severity === 'AMBER' && 'border-l-amber-400',
      flag.severity === 'GREEN' && 'border-l-[#76B900]'
    )}>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <SeverityBadge severity={flag.severity} />
        <code className="px-2 py-0.5 bg-white/5 text-white/50 text-xs rounded font-mono">
          {flag.clauseRef}
        </code>
        <span className="px-2 py-0.5 bg-white/8 text-white/70 border border-white/15 text-xs rounded-md font-medium">
          {flag.category}
        </span>
      </div>

      {/* Headline */}
      <h4 className="text-base font-semibold text-white leading-snug mb-2 text-balance">{flag.headline}</h4>

      {/* Explanation */}
      <p className="text-sm text-white/70 leading-relaxed mb-4">{flag.explanation}</p>

      {/* Benchmark comparison */}
      {flag.marketNorm && flag.docValue && (
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg mb-4 text-sm border border-white/8">
          <div className="flex-1">
            <span className="text-white/40 font-mono text-xs">Market norm:</span>{' '}
            <span className="text-[#76B900] font-semibold">{flag.marketNorm}</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex-1">
            <span className="text-white/40 font-mono text-xs">This contract:</span>{' '}
            <span className="text-red-400 font-semibold">{flag.docValue}</span>
          </div>
          {flag.deviation && (
            <>
              <div className="w-px h-8 bg-white/10" />
              <span className={cn(
                'px-2 py-0.5 rounded-md text-xs font-semibold border',
                flag.deviation === 'HIGH' && 'bg-red-500/15 text-red-400 border-red-500/30',
                flag.deviation === 'MEDIUM' && 'bg-amber-400/15 text-amber-300 border-amber-400/30',
                flag.deviation === 'LOW' && 'bg-[#76B900]/15 text-[#76B900] border-[#76B900]/30'
              )}>
                {flag.deviation}
              </span>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onExplainMore}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          Explain More
          <ChevronRight className="w-3 h-3" />
        </button>
        {flag.severity !== 'GREEN' && (
          <button
            onClick={onSuggestFix}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[#76B900] hover:bg-[#76B900]/10 border border-[#76B900]/30 hover:border-[#76B900]/50 rounded-lg transition-all"
          >
            <Lightbulb className="w-4 h-4" />
            Suggest a Fix
          </button>
        )}
      </div>
    </div>
  )
}

export function RiskDashboard({ report, onExplainMore, onSuggestFix, onNewDocument }: RiskDashboardProps) {
  const redCount = report.riskFlags.filter(f => f.severity === 'RED').length
  const amberCount = report.riskFlags.filter(f => f.severity === 'AMBER').length
  const greenCount = report.riskFlags.filter(f => f.severity === 'GREEN').length

  const sortedFlags = [...report.riskFlags].sort((a, b) => {
    const order = { RED: 0, AMBER: 1, GREEN: 2 }
    return order[a.severity] - order[b.severity]
  })

  return (
    <div className="space-y-6">
      {/* Upload New Document Button */}
      {onNewDocument && (
        <div className="flex justify-end">
          <button
            onClick={onNewDocument}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#76B900] hover:bg-[#76B900]/90 text-black font-semibold rounded-lg transition-all shadow-lg shadow-[#76B900]/20 hover:shadow-[#76B900]/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload New Document
          </button>
        </div>
      )}
      
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          severity="RED"
          count={redCount}
          label="Critical Risks"
          subtitle="Requires immediate attention"
        />
        <StatCard
          severity="AMBER"
          count={amberCount}
          label="Review Carefully"
          subtitle="Non-standard clauses"
        />
        <StatCard
          severity="GREEN"
          count={greenCount}
          label="Standard Clauses"
          subtitle="Expected for this doc type"
        />
      </div>

      {/* Overall Score Banner */}
      <div className="bg-[#141414] border border-white/10 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <RiskScoreDial score={report.overallScore} />
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-2">Executive Summary</h3>
            <p className="text-sm text-white/70 leading-relaxed">{report.executiveSummary}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/[0.08]">
          <span className="px-2 py-0.5 bg-white/8 text-white/70 border border-white/15 text-xs rounded-md font-medium">
            {report.classification.docType.replace('_', ' ')}
          </span>
          <span className="px-2 py-0.5 bg-white/8 text-white/70 border border-white/15 text-xs rounded-md font-medium">
            {report.classification.jurisdiction}
          </span>
          <span className="px-2 py-0.5 border border-[#76B900]/50 text-[#76B900] text-xs rounded-md font-mono font-semibold">
            via nemotron-super-120b
          </span>
        </div>
      </div>

      {/* Risk Flag Cards */}
      <div>
        <h3 className="text-base font-semibold text-white mb-4">Risk Flags ({sortedFlags.length})</h3>
        <div className="space-y-4">
          {sortedFlags.map(flag => (
            <RiskFlagCard
              key={flag.id}
              flag={flag}
              onExplainMore={() => onExplainMore(flag)}
              onSuggestFix={() => onSuggestFix(flag)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
