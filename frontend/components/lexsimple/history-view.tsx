'use client'

import { Clock, FileText, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react'
import type { HistoryItem } from '@/lib/types'

interface HistoryViewProps {
  history: HistoryItem[]
  onSelectItem: (item: HistoryItem) => void
}

export function HistoryView({ history, onSelectItem }: HistoryViewProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Clock className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-300 mb-2">Document History</h2>
        <p className="text-gray-500">Your analysis history will appear here</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Document History</h2>
      
      <div className="space-y-3">
        {history.map((item) => {
          const totalRisks = item.riskCount.red + item.riskCount.amber + item.riskCount.green
          
          return (
            <button
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-green-500/50 transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors">
                      {item.fileName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(item.timestamp).toLocaleDateString()} at{' '}
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {item.overallScore}/10
                  </div>
                  <div className="text-xs text-gray-500 uppercase">
                    {item.docType.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-800">
                {item.riskCount.red > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-400">{item.riskCount.red} High</span>
                  </div>
                )}
                {item.riskCount.amber > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-amber-400">{item.riskCount.amber} Medium</span>
                  </div>
                )}
                {item.riskCount.green > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-green-400">{item.riskCount.green} Low</span>
                  </div>
                )}
                {totalRisks === 0 && (
                  <span className="text-sm text-gray-500">No risks detected</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
