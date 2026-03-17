'use client'

import { FileText, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AgentPlan, type Task } from '@/components/ui/agent-plan'
import type { AgentStatus } from '@/lib/types'
import { useMemo } from 'react'

interface AnalysisProgressProps {
  fileName: string
  fileType: string
  agents: AgentStatus[]
  progress: number
}

function agentsToTasks(agents: AgentStatus[]): Task[] {
  return agents.map((agent, index) => ({
    id: `agent-${index}`,
    title: agent.name,
    description: `Processing with ${agent.model}`,
    status: agent.status === 'running' ? 'in-progress' : agent.status === 'complete' ? 'completed' : 'pending',
    model: agent.model,
    subtasks: getSubtasksForAgent(agent.name, agent.status, agent.result)
  }))
}

function getSubtasksForAgent(agentName: string, status: string, result?: string): Task['subtasks'] {
  const agentSubtasks: Record<string, { title: string; description: string; tools: string[] }[]> = {
    'Document Classifier': [
      { title: 'Parse document structure', description: 'Extract text and identify document format', tools: ['text-parser', 'format-detector'] },
      { title: 'Identify document type', description: 'Classify as lease, NDA, employment, etc.', tools: ['classification-model'] },
      { title: 'Extract metadata', description: 'Pull dates, parties, and jurisdiction', tools: ['entity-extractor'] }
    ],
    'Risk Analyzer': [
      { title: 'Scan for red flag patterns', description: 'Check against database of problematic clauses', tools: ['pattern-matcher', 'risk-db'] },
      { title: 'Compare to standard terms', description: 'Benchmark against industry standards', tools: ['benchmark-engine'] },
      { title: 'Calculate severity scores', description: 'Assign RED/AMBER/GREEN ratings', tools: ['scoring-model'] }
    ],
    'Fact Extractor': [
      { title: 'Extract key terms', description: 'Pull out important dates, amounts, parties', tools: ['ner-model', 'date-parser'] },
      { title: 'Identify obligations', description: 'Find what each party must do', tools: ['obligation-extractor'] },
      { title: 'Map clause references', description: 'Link facts to source sections', tools: ['reference-mapper'] }
    ],
    'Simplifier': [
      { title: 'Analyze reading level', description: 'Calculate Flesch-Kincaid grade', tools: ['readability-analyzer'] },
      { title: 'Rewrite complex clauses', description: 'Convert to plain language', tools: ['nemotron-llama'] },
      { title: 'Preserve legal accuracy', description: 'Ensure simplified text is legally equivalent', tools: ['accuracy-checker'] }
    ],
    'Report Generator': [
      { title: 'Compile findings', description: 'Aggregate results from all agents', tools: ['aggregator'] },
      { title: 'Generate summary', description: 'Create executive overview', tools: ['summary-model'] },
      { title: 'Format report', description: 'Produce final structured output', tools: ['report-formatter'] }
    ]
  }

  const subtasks = agentSubtasks[agentName] || []
  
  return subtasks.map((st, i) => {
    let subtaskStatus: 'completed' | 'in-progress' | 'pending' = 'pending'
    
    if (status === 'complete') {
      subtaskStatus = 'completed'
    } else if (status === 'running') {
      if (i === 0) subtaskStatus = 'completed'
      else if (i === 1) subtaskStatus = 'in-progress'
      else subtaskStatus = 'pending'
    }
    
    return {
      id: `subtask-${i}`,
      title: st.title,
      description: st.description,
      status: subtaskStatus,
      tools: st.tools
    }
  })
}

export function AnalysisProgress({ fileName, fileType, agents, progress }: AnalysisProgressProps) {
  const tasks = useMemo(() => agentsToTasks(agents), [agents])
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
      <div className="w-full max-w-2xl">
        {/* Header card */}
        <div className="bg-[#141414] border border-white/10 rounded-xl p-6 mb-4">
          {/* File info */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.08]">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white/80" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold truncate text-lg">{fileName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-white/8 text-white/70 border border-white/15 rounded text-xs font-mono">
                  {fileType.toUpperCase()}
                </span>
                <span className="text-white/40 text-sm">Analyzing document...</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#76B900] animate-pulse" />
              <span className="text-[#76B900] font-black text-lg">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/70 font-medium">LangGraph Agent Pipeline</span>
              <span className="text-white/40">{agents.filter(a => a.status === 'complete').length}/{agents.length} complete</span>
            </div>
            <div className="h-2 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#76B900] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Agent Plan */}
        <AgentPlan tasks={tasks} />
        
        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-white/40 font-medium">
            Powered by NVIDIA Nemotron + LangGraph
          </p>
        </div>
      </div>
    </div>
  )
}
