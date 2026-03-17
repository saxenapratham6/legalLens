# LexSimple ⚖️

**AI-Powered Legal Document Analysis** — built for the SJSU NVIDIA Hackathon 2026

LexSimple transforms complex legal documents into plain-language summaries, surfaces risk flags with severity tiers, extracts structured facts, and lets users generate revised clause language through natural conversation.

> 🏆 **NVIDIA Prize Compliant:** Nemotron tool-calling • ReAct reasoning loops • Agentic RAG • Multi-agent orchestration

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Risk Dashboard** | RED / AMBER / GREEN severity flags with 12-word headlines and negotiation suggestions |
| **Fact Extraction** | Structured table of payments, dates, parties, obligations, and termination conditions |
| **Plain-Language Summary** | Section-by-section rewrite at 9th-grade reading level |
| **Conversational Q&A** | Ask questions about the document — every answer cites a specific clause reference |
| **Draft Generator** | One-click clause rewriting with original vs. proposed diff and risk delta |
| **ReAct Risk Scanner** | Multi-step reasoning loop: Reason → Score → Retrieve precedent → Revise — not just prompting |

## 🏗️ Architecture

```
                    ┌──────────────┐
                    │   Upload     │
                    │  (PDF/DOCX)  │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Ingest &   │
                    │    Chunk     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Classifier  │  ← Nemotron Nano (fast)
                    │  (doc type)  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌──▼──────┐ ┌──▼────────┐
       │ Simplifier  │ │  Risk   │ │ Extractor  │  ← Parallel
       │  (Nano)     │ │ Scanner │ │  (Nano)    │
       └──────┬──────┘ │(Super)  │ └──┬────────┘
              │        │ ReAct ★ │    │
              │        └──┬──────┘    │
              │           │           │
              │     ┌─────▼─────┐     │
              │     │Comparator │ ←───┘
              │     │ (Super)   │
              │     └─────┬─────┘
              │           │
              └─────┬─────┘
                    │
             ┌──────▼───────┐
             │Report Builder│  ← Nemotron Super
             └──────┬───────┘
                    │
             ┌──────▼───────┐     ┌──────────────┐
             │  Q&A Agent   │────▶│Draft Generator│
             │  (Super)     │◀────│   (Super)     │
             └──────────────┘     └──────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **LLM (Reasoning)** | NVIDIA Nemotron-super-120b via OpenRouter |
| **LLM (Fast tasks)** | NVIDIA Nemotron-nano-9b via OpenRouter |
| **Backend API** | FastAPI (Python 3.11+) |
| **Orchestration** | LangGraph-style sequential pipeline |
| **Frontend** | React + Tailwind CSS (Vercel v0) |
| **PDF Parsing** | pdfplumber |
| **RAG** | In-memory keyword store (hackathon scope) |

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/manavsh7/legalLens.git
cd legalLens

# 2. Create virtual environment
python3 -m venv .venv && source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set your API key
cp .env.example .env
# Edit .env and add your OpenRouter key

# 5. Run the server
uvicorn backend.main:app --port 8000
```

The API is now live at `http://localhost:8000`

## 📡 API Endpoints

### `GET /health`
Health check.

### `POST /api/analyze`
Run the full analysis pipeline on a document.

```json
// Request
{ "text": "This lease agreement is entered into..." }

// Response
{
  "doc_type": "lease",
  "jurisdiction": "California",
  "confidence": 0.95,
  "risk_flags": [
    {
      "clause_ref": "Section 1",
      "severity": "RED",
      "category": "Auto-renewal trap",
      "headline": "Auto-renewal with only 7-day notice",
      "explanation": "The lease renews automatically each year unless you give just one week's notice.",
      "suggestion": "Negotiate to increase notice period to at least 60 days."
    }
  ],
  "facts": [
    { "label": "Monthly Rent", "value": "$2,400.00", "clause_ref": "Section 2", "category": "payment" }
  ],
  "simplified": [...],
  "comparisons": [...],
  "report": {...}
}
```

### `POST /api/chat`
Conversational Q&A about the analyzed document.

```json
// Request
{ "session_id": "abc", "message": "What happens if I break the lease early?", "report": {...} }

// Response
{ "answer": "The lease imposes an early termination fee of 3 months' rent ($7,200)...", "session_id": "abc" }
```

### `POST /api/draft`
Generate a revised clause.

```json
// Request
{ "instruction": "Change the notice period from 7 days to 60 days", "risk_flags": [...] }

// Response
{
  "original": "...at least seven (7) days prior...",
  "proposed": "...at least sixty (60) days prior...",
  "change_summary": "Changed notice period from 7 to 60 days.",
  "risk_delta": "Reduces risk of unintended auto-renewal."
}
```

## 📁 Project Structure

```
legalLens/
├── AGENTS.md                  # Project context (included in every AI query)
├── requirements.txt
├── .env.example
│
├── agents/                    # LangGraph pipeline agents
│   ├── SKILL.md               # Agent architecture overview
│   ├── orchestrator/          # State + graph wiring
│   ├── classifier/            # Doc type detection (Nano)
│   ├── risk_scanner/          # ReAct risk loop (Super) ★
│   ├── simplifier/            # Plain-English rewrites (Nano)
│   ├── extractor/             # Fact extraction (Nano)
│   ├── comparator/            # Market norm benchmarking (Super)
│   ├── report_builder/        # Report synthesis (Super)
│   ├── qa_agent/              # Conversational Q&A (Super)
│   ├── draft_generator/       # Clause rewriting (Super)
│   ├── tools/                 # Tool schemas, RAG, parsers
│   └── config/                # Model constants, master prompt
│
├── backend/                   # FastAPI server
│   ├── main.py                # App entry point + CORS
│   └── routes/
│       ├── analyze.py         # POST /api/analyze
│       ├── chat.py            # POST /api/chat
│       └── draft.py           # POST /api/draft
│
└── .agents/                   # AI coding assistant sub-agents
    ├── planner.md
    ├── manager.md
    ├── developer.md
    ├── devops.md
    ├── qa.md
    ├── code_reviewer.md
    └── workflows/
```

## ⚠️ Disclaimer

LexSimple is an AI assistant, **not a lawyer**. Every response involving legal risk includes:

> *"This is not legal advice. For high-stakes decisions, please consult a licensed attorney."*

## 📜 License

Built for the SJSU NVIDIA Hackathon 2026.

---

*LexSimple — Legal literacy shouldn't be a privilege. With Nemotron, we made it a default.*
