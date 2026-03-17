'use client'

import { Download, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Fact, FactCategory } from '@/lib/types'

interface FactCardProps {
  facts: Fact[]
}

const categoryColors: Record<FactCategory, string> = {
  payment: 'bg-white/8 text-white/70 border border-white/15',
  date: 'bg-white/8 text-white/70 border border-white/15',
  party: 'bg-white/8 text-white/70 border border-white/15',
  obligation: 'bg-white/8 text-white/70 border border-white/15',
  jurisdiction: 'bg-white/8 text-white/70 border border-white/15',
  termination: 'bg-white/8 text-white/70 border border-white/15',
}

export function FactCard({ facts }: FactCardProps) {
  const handleExport = () => {
    const csv = [
      ['Label', 'Value', 'Clause Reference', 'Category'].join(','),
      ...facts.map(f => [
        `"${f.label}"`,
        `"${f.value || 'Not specified'}"`,
        `"${f.clauseRef}"`,
        `"${f.category}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'legal-lense-facts.csv'
    a.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Extracted Facts ({facts.length})</h3>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
        >
          <Download className="w-4 h-4" />
          Export as CSV
        </button>
      </div>

      <div className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.08]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                Label
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                Value
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                Clause Ref
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                Category
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {facts.map((fact, index) => (
              <tr
                key={fact.id}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-5 py-4 text-sm text-white font-medium">
                  {fact.label}
                </td>
                <td className="px-5 py-4 text-sm">
                  {fact.value ? (
                    <span className="text-white/70">{fact.value}</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-amber-300 italic">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Not specified
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <code className="px-2 py-0.5 bg-white/5 text-white/50 text-xs rounded font-mono">
                    {fact.clauseRef}
                  </code>
                </td>
                <td className="px-5 py-4">
                  <span className={cn(
                    'px-2 py-0.5 rounded-md text-xs capitalize font-medium',
                    categoryColors[fact.category]
                  )}>
                    {fact.category}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
