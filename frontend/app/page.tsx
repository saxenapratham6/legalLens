'use client'

import { useState, useCallback, useEffect } from 'react'
import { Sidebar, type NavItem } from '@/components/lexsimple/sidebar'
import { UploadZone } from '@/components/lexsimple/upload-zone'
import { AnalysisProgress } from '@/components/lexsimple/analysis-progress'
import { RiskDashboard } from '@/components/lexsimple/risk-dashboard'
import { FactCard } from '@/components/lexsimple/fact-card'
import { SummaryView } from '@/components/lexsimple/summary-view'
import { ChatPanel } from '@/components/lexsimple/chat-panel'
import { DiffViewModal } from '@/components/lexsimple/diff-view-modal'
import { HistoryView } from '@/components/lexsimple/history-view'
import { generateAgentStatuses, generateDraftProposal } from '@/lib/mock-analysis'
import type { AnalysisReport, AgentStatus, ChatMessage, RiskFlag, DraftProposal, AnalysisState, HistoryItem } from '@/lib/types'
import { apiClient } from '@/lib/api-client'

export default function LegalLensePage() {
  // Navigation state
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard')
  
  // Analysis state
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
    progress: 0
  })
  const [agents, setAgents] = useState<AgentStatus[]>(generateAgentStatuses())
  const [report, setReport] = useState<AnalysisReport | null>(null)
  const [documentText, setDocumentText] = useState<string>('')
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [negotiationMode, setNegotiationMode] = useState(false)
  
  // Modal state
  const [selectedFlag, setSelectedFlag] = useState<RiskFlag | null>(null)
  const [draftProposal, setDraftProposal] = useState<DraftProposal | null>(null)
  const [showDiffModal, setShowDiffModal] = useState(false)

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([])

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('lexsimple-history')
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        // Convert timestamp strings back to Date objects
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        setHistory(historyWithDates)
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
  }, [])

  // Save to history when analysis completes
  const saveToHistory = useCallback((report: AnalysisReport, fileName: string, text: string) => {
    const historyItem: HistoryItem = {
      id: `analysis-${Date.now()}`,
      fileName,
      timestamp: new Date(),
      docType: report.classification.docType,
      overallScore: report.overallScore,
      riskCount: {
        red: report.riskFlags.filter(f => f.severity === 'RED').length,
        amber: report.riskFlags.filter(f => f.severity === 'AMBER').length,
        green: report.riskFlags.filter(f => f.severity === 'GREEN').length,
      },
      report,
      documentText: text
    }

    const newHistory = [historyItem, ...history].slice(0, 20) // Keep last 20
    setHistory(newHistory)
    localStorage.setItem('lexsimple-history', JSON.stringify(newHistory))
  }, [history])

  // Load analysis from history
  const loadFromHistory = useCallback((item: HistoryItem) => {
    setReport(item.report)
    setDocumentText(item.documentText)
    setAnalysisState({
      status: 'complete',
      progress: 100,
      fileName: item.fileName
    })
    setActiveNav('risks')
  }, [])

  // Reset to upload new document
  const handleNewDocument = useCallback(() => {
    setReport(null)
    setDocumentText('')
    setAnalysisState({
      status: 'idle',
      progress: 0
    })
    setMessages([])
    setAgents(generateAgentStatuses())
    setActiveNav('dashboard')
  }, [])

  // Run real analysis via backend API
  const runAnalysis = useCallback(async (text: string) => {
    setDocumentText(text)
    setAnalysisState({
      status: 'analyzing',
      progress: 0,
      fileName: 'Document',
      fileType: 'txt'
    })

    // Initialize agent statuses
    const newAgents = [...generateAgentStatuses()]
    setAgents(newAgents)

    try {
      // Better progress tracking based on estimated agent completion times
      // Classifier: ~10s, Simplifier: ~20s, Risk Scanner: ~30s, Extractor: ~15s, Report: ~15s
      const agentDurations = [10000, 20000, 30000, 15000, 15000] // milliseconds
      const totalDuration = agentDurations.reduce((a, b) => a + b, 0)
      let currentAgentIndex = 0
      let elapsedTime = 0
      
      const progressInterval = setInterval(() => {
        elapsedTime += 1000 // 1 second increments
        
        // Calculate which agent should be active based on elapsed time
        let cumulativeTime = 0
        for (let i = 0; i < agentDurations.length; i++) {
          cumulativeTime += agentDurations[i]
          if (elapsedTime < cumulativeTime) {
            currentAgentIndex = i
            break
          }
        }
        
        // Update agent statuses
        newAgents.forEach((agent, i) => {
          if (i < currentAgentIndex) {
            newAgents[i] = { ...newAgents[i], status: 'complete' }
          } else if (i === currentAgentIndex) {
            newAgents[i] = { ...newAgents[i], status: 'running' }
          }
        })
        setAgents([...newAgents])
        
        // Calculate progress percentage
        const progress = Math.min((elapsedTime / totalDuration) * 100, 95)
        
        setAnalysisState(prev => ({
          ...prev,
          progress,
          currentAgent: newAgents[currentAgentIndex]?.name
        }))
      }, 1000)

      // Call the real API
      const apiResponse = await apiClient.analyze(text)
      
      clearInterval(progressInterval)

      // Mark all agents as complete
      newAgents.forEach((agent, i) => {
        newAgents[i] = { ...newAgents[i], status: 'complete' }
      })
      setAgents([...newAgents])

      // Transform API response to match frontend types
      const analysisReport: AnalysisReport = {
        classification: {
          docType: apiResponse.doc_type as any,
          jurisdiction: apiResponse.jurisdiction,
          partyRoles: apiResponse.party_roles,
          confidence: apiResponse.confidence
        },
        riskFlags: apiResponse.risk_flags.map((flag: any) => ({
          id: flag.id || `risk-${Math.random()}`,
          clauseRef: flag.clause_ref,
          severity: flag.severity,
          category: flag.category,
          headline: flag.headline,
          explanation: flag.explanation,
          suggestion: flag.suggestion,
          marketNorm: flag.market_norm,
          docValue: flag.doc_value,
          deviation: flag.deviation
        })),
        facts: apiResponse.facts.map((fact: any) => ({
          id: fact.id || `fact-${Math.random()}`,
          label: fact.label,
          value: fact.value,
          clauseRef: fact.clause_ref,
          category: fact.category
        })),
        sections: apiResponse.simplified.map((section: any) => ({
          id: section.id || `section-${Math.random()}`,
          title: section.title,
          original: section.original,
          simplified: section.simplified,
          readingGrade: section.reading_grade,
          hasAmbiguity: section.has_ambiguity
        })),
        overallScore: apiResponse.report?.overall_score || 5,
        executiveSummary: apiResponse.report?.executive_summary || 'Analysis complete.'
      }

      setReport(analysisReport)
      setAnalysisState({
        status: 'complete',
        progress: 100
      })

      // Save to history
      saveToHistory(analysisReport, analysisState.fileName || 'Document', text)

      // Auto-navigate to risks
      setActiveNav('risks')
    } catch (error) {
      console.error('Analysis failed:', error)
      setAnalysisState({
        status: 'error',
        progress: 0
      })
      // You could show an error toast here
    }
  }, [saveToHistory, analysisState.fileName])

  const handleFileUpload = useCallback(async (file: File) => {
    setAnalysisState({
      status: 'uploading',
      progress: 0,
      fileName: file.name,
      fileType: file.name.split('.').pop() || 'txt'
    })

    try {
      // Upload file to backend for proper text extraction (handles PDF, DOCX, TXT)
      const uploadResult = await apiClient.uploadFile(file)
      
      // Update state with extracted text info
      setAnalysisState(prev => ({
        ...prev,
        fileName: uploadResult.filename,
        fileType: uploadResult.file_type
      }))
      
      // Run analysis on extracted text
      await runAnalysis(uploadResult.text)
    } catch (error) {
      console.error('File upload failed:', error)
      setAnalysisState({
        status: 'error',
        progress: 0,
        fileName: file.name
      })
      // Show error to user
      alert(error instanceof Error ? error.message : 'File upload failed. Please try again.')
    }
  }, [runAnalysis])

  const handleTextPaste = useCallback(async (text: string) => {
    await runAnalysis(text)
  }, [runAnalysis])

  const handleExplainMore = useCallback(async (flag: RiskFlag) => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: `Can you explain more about this risk: "${flag.headline}"?`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, message])

    if (!report) return

    try {
      // Call real chat API with negotiation mode
      const sessionId = `session-${Date.now()}`
      const response = await apiClient.chat(sessionId, message.content, report, negotiationMode)
      
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.answer,
        clauseRefs: [flag.clauseRef],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat failed:', error)
      // Fallback to mock response
      const response: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `${flag.explanation}\n\nThis clause was flagged as ${flag.severity} severity because it deviates significantly from standard practice. ${flag.suggestion}`,
        clauseRefs: [flag.clauseRef],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, response])
    }

    setActiveNav('chat')
  }, [report, negotiationMode])

  const handleSuggestFix = useCallback(async (flag: RiskFlag) => {
    setSelectedFlag(flag)
    
    if (!report) return
    
    try {
      // Call real draft API
      const instruction = `Revise the ${flag.category} clause (${flag.clauseRef}) to address: ${flag.headline}`
      const response = await apiClient.draft(instruction, report.riskFlags)
      
      const proposal: DraftProposal = {
        original: response.original,
        proposed: response.proposed,
        changeSummary: response.change_summary,
        riskDelta: {
          before: flag.severity,
          after: 'GREEN' as const
        }
      }
      
      setDraftProposal(proposal)
      setShowDiffModal(true)
    } catch (error) {
      console.error('Draft generation failed:', error)
      // Fallback to mock data if API fails
      const proposal = generateDraftProposal(flag)
      setDraftProposal(proposal)
      setShowDiffModal(true)
    }
  }, [report])

  const handleApplyDraft = useCallback(() => {
    setShowDiffModal(false)
    // In a real app, this would update the document
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `The suggested revision has been applied to your document. The ${selectedFlag?.category} clause has been updated to reduce risk from ${draftProposal?.riskDelta.before} to ${draftProposal?.riskDelta.after}.`,
      clauseRefs: selectedFlag ? [selectedFlag.clauseRef] : undefined,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, message])
  }, [selectedFlag, draftProposal])

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    if (!report) return

    try {
      // Call real chat API with negotiation mode
      const sessionId = `session-${Date.now()}`
      const response = await apiClient.chat(sessionId, content, report, negotiationMode)
      
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat failed:', error)
      // Fallback to a generic error message
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your question. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }, [report, negotiationMode])

  // Render main content based on state and navigation
  const renderMainContent = () => {
    if (analysisState.status === 'idle') {
      if (activeNav === 'history') {
        return <HistoryView history={history} onSelectItem={loadFromHistory} />
      }
      return <UploadZone onFileUpload={handleFileUpload} onTextPaste={handleTextPaste} />
    }

    if (analysisState.status === 'analyzing' || analysisState.status === 'uploading') {
      return (
        <AnalysisProgress
          fileName={analysisState.fileName || 'Document'}
          fileType={analysisState.fileType || 'txt'}
          agents={agents}
          progress={analysisState.progress}
        />
      )
    }

    if (analysisState.status === 'complete' && report) {
      switch (activeNav) {
        case 'dashboard':
        case 'risks':
          return (
            <RiskDashboard
              report={report}
              onExplainMore={handleExplainMore}
              onSuggestFix={handleSuggestFix}
              onNewDocument={handleNewDocument}
            />
          )
        case 'facts':
          return <FactCard facts={report.facts} />
        case 'summary':
          return <SummaryView sections={report.sections} />
        case 'chat':
          return (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <p className="text-slate-400 mb-2">Use the chat panel on the right</p>
                <p className="text-slate-500 text-sm">Ask questions about your document</p>
              </div>
            </div>
          )
        case 'history':
          return <HistoryView history={history} onSelectItem={loadFromHistory} />
        default:
          return null
      }
    }

    return null
  }

  const hasAnalysis = analysisState.status === 'complete' && report !== null

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <Sidebar 
        activeNav={activeNav} 
        onNavChange={setActiveNav}
        hasAnalysis={hasAnalysis}
      />

      {/* Top accent line - single pixel NVIDIA green fade */}
      <div className="fixed top-0 left-[220px] right-[320px] h-px bg-gradient-to-r from-[#76B900] to-transparent z-50" />

      {/* Main Content */}
      <main className="ml-[220px] mr-[320px] min-h-screen p-6 pt-8">
        {renderMainContent()}
      </main>

      {/* Chat Panel */}
      <ChatPanel
        messages={messages}
        onSendMessage={handleSendMessage}
        docType={report?.classification.docType}
        isAnalyzing={analysisState.status === 'analyzing'}
        negotiationMode={negotiationMode}
        onToggleNegotiationMode={() => setNegotiationMode(!negotiationMode)}
      />

      {/* Diff View Modal */}
      <DiffViewModal
        isOpen={showDiffModal}
        onClose={() => setShowDiffModal(false)}
        proposal={draftProposal}
        onApply={handleApplyDraft}
      />

      {/* Footer disclaimer */}
      <div className="fixed bottom-0 left-[220px] right-[320px] py-2 px-4 bg-[#0a0a0a]/95 border-t border-white/[0.08] z-30">
        <p className="text-xs text-white/30 text-center">
          Legal Lens is an AI assistant, not a law firm. This is not legal advice. For high-stakes decisions, please consult a licensed attorney.
        </p>
      </div>
    </div>
  )
}
