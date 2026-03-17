import type { AnalysisReport, ChatMessage } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface AnalyzeRequest {
  text: string
}

export interface AnalyzeResponse extends AnalysisReport {}

export interface ChatRequest {
  session_id: string
  message: string
  report: AnalysisReport
}

export interface ChatResponse {
  answer: string
  session_id: string
}

export interface DraftRequest {
  instruction: string
  risk_flags: AnalysisReport['riskFlags']
}

export interface DraftResponse {
  original: string
  proposed: string
  change_summary: string
  risk_delta: string
}

class APIClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  async analyze(text: string): Promise<AnalysisReport> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 600000) // 10 minute timeout

    try {
      const response = await fetch(`${this.baseURL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Analysis timed out after 10 minutes. The document may be too long or the API is slow.')
      }
      throw error
    }
  }

  async chat(sessionId: string, message: string, report: AnalysisReport, negotiationMode: boolean = false): Promise<ChatResponse> {
    const response = await fetch(`${this.baseURL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        message,
        report,
        negotiation_mode: negotiationMode,
      }),
    })

    if (!response.ok) {
      throw new Error(`Chat failed: ${response.statusText}`)
    }

    return response.json()
  }

  async draft(instruction: string, riskFlags: AnalysisReport['riskFlags']): Promise<DraftResponse> {
    const response = await fetch(`${this.baseURL}/api/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instruction,
        risk_flags: riskFlags,
      }),
    })

    if (!response.ok) {
      throw new Error(`Draft generation failed: ${response.statusText}`)
    }

    return response.json()
  }

  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await fetch(`${this.baseURL}/health`)
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`)
    }

    return response.json()
  }

  async uploadFile(file: File): Promise<{ text: string; filename: string; file_type: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseURL}/api/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new Error(error.detail || `Upload failed: ${response.statusText}`)
    }

    return response.json()
  }
}

export const apiClient = new APIClient()
