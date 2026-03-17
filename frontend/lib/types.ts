// Legal Lens Type Definitions

export type Severity = 'RED' | 'AMBER' | 'GREEN'
export type Deviation = 'LOW' | 'MEDIUM' | 'HIGH'

export type DocumentType = 
  | 'lease'
  | 'employment_contract'
  | 'NDA'
  | 'SaaS_terms'
  | 'loan_agreement'
  | 'insurance_policy'
  | 'service_agreement'
  | 'consulting_contract'
  | 'equity_agreement'
  | 'medical_consent'
  | 'privacy_policy'
  | 'partnership_agreement'

export type FactCategory = 
  | 'payment'
  | 'date'
  | 'party'
  | 'obligation'
  | 'jurisdiction'
  | 'termination'

export type RiskCategory =
  | 'Auto-Renewal'
  | 'Unilateral Amendment'
  | 'Indemnification'
  | 'IP Rights'
  | 'Non-Compete'
  | 'Arbitration'
  | 'Deposit'
  | 'Hidden Fees'
  | 'Interest Rate'
  | 'Data Privacy'
  | 'Termination'
  | 'Notice Period'
  | 'Deliverables'
  | 'Force Majeure'
  | 'Liquidated Damages'
  | 'Jurisdiction'
  | 'Standard'

export interface RiskFlag {
  id: string
  clauseRef: string
  severity: Severity
  category: RiskCategory
  headline: string
  explanation: string
  suggestion: string
  marketNorm?: string
  docValue?: string
  deviation?: Deviation
}

export interface Fact {
  id: string
  label: string
  value: string | null
  clauseRef: string
  category: FactCategory
}

export interface Section {
  id: string
  title: string
  original: string
  simplified: string
  readingGrade?: number
  hasAmbiguity?: boolean
}

export interface DocumentClassification {
  docType: DocumentType
  jurisdiction: string
  partyRoles: {
    user: string
    counterparty: string
  }
  confidence: number
}

export interface AnalysisState {
  status: 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'
  currentAgent?: string
  progress: number
  fileName?: string
  fileType?: string
}

export interface AgentStatus {
  name: string
  model: 'nemotron-nano-9b' | 'nemotron-super-120b'
  status: 'pending' | 'running' | 'complete'
  result?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  clauseRefs?: string[]
  timestamp: Date
}

export interface DraftProposal {
  original: string
  proposed: string
  changeSummary: string
  riskDelta: {
    before: Severity
    after: Severity
  }
}

export interface AnalysisReport {
  classification: DocumentClassification
  riskFlags: RiskFlag[]
  facts: Fact[]
  sections: Section[]
  overallScore: number
  executiveSummary: string
}

export interface HistoryItem {
  id: string
  fileName: string
  timestamp: Date
  docType: DocumentType
  overallScore: number
  riskCount: {
    red: number
    amber: number
    green: number
  }
  report: AnalysisReport
  documentText: string
}
