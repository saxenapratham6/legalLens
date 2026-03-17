# LexSimple — Project Context for LLM Handoff

## What This Is
LexSimple is a **working** AI-powered legal document analysis backend for the SJSU NVIDIA Hackathon 2026. It takes any legal document, runs it through 8 specialized AI agents, and returns risk flags, a plain-English summary, structured facts, and can rewrite problematic clauses.

## What's Built & Working
- **FastAPI backend** at `backend/main.py` — 3 endpoints, all verified working:
  - `POST /api/analyze` — full pipeline: classify → simplify → risk_scan → extract → compare → report
  - `POST /api/chat` — conversational Q&A with clause citations + legal disclaimer
  - `POST /api/draft` — clause rewriting (original → proposed → change_summary → risk_delta)
- **8 pipeline agents** in `agents/` — each has `agent.py` (logic) + `prompts.py` (system prompt):
  - `classifier/` (Nano) — detects doc_type, jurisdiction, party_roles
  - `risk_scanner/` (Super) — **ReAct loop**: Reason → score_risk tool call → retrieve_precedent if low confidence → re-score. Deduplicates by (clause_ref, category).
  - `simplifier/` (Nano) — 9th-grade reading level rewrites
  - `extractor/` (Nano) — structured fact extraction via function calling
  - `comparator/` (Super) — benchmarks flagged clauses against market norms
  - `report_builder/` (Super) — synthesizes 6-section report
  - `qa_agent/` (Super) — chat with clause citations, detects draft-request intents
  - `draft_generator/` (Super) — rewrites clauses per user instructions
- **Shared tools** in `agents/tools/`:
  - `tool_schemas.py` — 7 OpenAI-format function-calling schemas
  - `rag.py` — lightweight keyword-based retrieval (agentic RAG)
  - `parsers.py` — PDF/DOCX/TXT extraction + 800-token/150-overlap chunking
- **Config** in `agents/config/`:
  - `models.py` — OpenRouter client factory + model constants
  - `prompts.py` — master system prompt from PRD Section 7

## Key Technical Details
- **Models** (via OpenRouter `https://openrouter.ai/api/v1`):
  - Fast: `nvidia/nemotron-nano-9b-v2`
  - Reasoning: `nvidia/nemotron-3-super-120b-a12b:free`
- **State:** `LexSimpleState` TypedDict in `agents/orchestrator/state.py` — all agents read/write to this dict
- **Agent interface:** every agent exports `run(state: LexSimpleState) -> dict`
- **Pipeline runs sequentially** (not using LangGraph runtime, just calling agents in order). Graph definition exists in `orchestrator/graph.py` for future use.
- **CORS** configured for `localhost:3000` and `lexsimple.vercel.app`
- **Python 3.11+**, venv at `.venv/`, deps in `requirements.txt`
- **API key** in `.env` (gitignored), template in `.env.example`

## What's NOT Built Yet
- **Frontend** — UI is being built separately (React + Tailwind via Vercel v0). Expects the 3 JSON endpoints above.
- **File upload endpoint** — currently frontend must extract text client-side and send raw text to `/api/analyze`
- **LangGraph runtime** — graph is defined but pipeline runs sequentially. Wire to LangGraph for parallel execution.
- **Persistent sessions** — chat sessions are in-memory only
- **Auth / user accounts** — none (hackathon scope)

## To Run
```bash
source .venv/bin/activate
export OPENROUTER_API_KEY="your-key"
uvicorn backend.main:app --port 8000
```

## Repo
https://github.com/manavsh7/legalLens.git
