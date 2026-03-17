# LexSimple — Project Context

> **This file is included in every AI assistant query as project-level context.**
> It describes the project, architecture, conventions, and constraints so that
> any AI agent (planner, developer, reviewer, etc.) can orient itself immediately.

---

## Project Overview

**LexSimple** is an AI-powered legal document analysis platform built for the
SJSU NVIDIA Hackathon 2026. It transforms complex legal documents into
plain-language summaries, surfaces risk flags with severity tiers, extracts
structured facts, and lets users generate revised clause language through
natural conversation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **LLM (Reasoning)** | NVIDIA Nemotron-super-120b-a12b via OpenRouter |
| **LLM (Fast tasks)** | nvidia-nemotron-nano-9b-v2 via OpenRouter |
| **Orchestration** | LangGraph StateGraph (Python) |
| **Backend API** | FastAPI (Python 3.11+) |
| **Frontend** | React + Tailwind CSS (generated via Vercel v0) |
| **PDF/DOCX Parsing** | pdfplumber / mammoth.js |
| **Vector Store (RAG)** | LangChain MemoryVectorStore (in-memory) |
| **Deployment** | Vercel (frontend) + serverless (backend) |

## Repository Structure

```
legalLens/
├── AGENTS.md                 # ← THIS FILE — included in every AI query
├── agents/                   # LangGraph pipeline agent modules
│   ├── SKILL.md              # Agent architecture overview
│   ├── orchestrator/         # Graph definition + shared state
│   ├── classifier/           # Doc type detection (Nano)
│   ├── simplifier/           # Plain-English rewrites (Nano)
│   ├── risk_scanner/         # ReAct risk loop (Super) ★ flagship
│   ├── extractor/            # Fact extraction (Nano)
│   ├── comparator/           # Market norm benchmarking (Super)
│   ├── report_builder/       # Synthesis agent (Super)
│   ├── qa_agent/             # Conversational Q&A (Super)
│   ├── draft_generator/      # Clause rewriting (Super)
│   ├── tools/                # Shared tool schemas, RAG, parsers
│   └── config/               # Model constants, master prompt
├── .agents/                  # Team sub-agents (planner, dev, QA, etc.)
│   ├── planner.md
│   ├── manager.md
│   ├── developer.md
│   ├── devops.md
│   ├── qa.md
│   ├── code_reviewer.md
│   └── workflows/
├── frontend/                 # React + Tailwind UI (v0 generated)
└── tests/                    # Test fixtures and integration tests
```

## Conventions

- **Python 3.11+** — use `TypedDict`, `list[dict]`, `str | None` syntax.
- **Every agent** exports a `run(state: LexSimpleState) -> dict` function.
- **Prompts** live in `prompts.py` inside each agent folder, separate from logic.
- **Tool schemas** are centralized in `agents/tools/tool_schemas.py`.
- **Environment variables:** `OPENROUTER_API_KEY` must be set before running.
- **No external databases** for hackathon — use in-memory stores only.

## Model Routing Rules

| Task Type | Model | Rationale |
|-----------|-------|-----------|
| Classification, extraction, simplification | **Nano-9b** | Fast, structured output |
| Risk analysis, benchmarking, report, Q&A, drafting | **Super-120b** | Deep reasoning needed |

## Key Constraints

1. **2-hour build window** — prioritize working demo over perfection.
2. **3-minute demo** — every feature must be demo-able in the judge walkthrough.
3. **NVIDIA prize compliance** — must demonstrate: Nemotron, tool-calling, ReAct, agentic RAG, multi-agent orchestration.
4. **Not legal advice** — every user-facing response must include the legal disclaimer.

## API Configuration

- **Base URL:** `https://openrouter.ai/api/v1`
- **Models:** `nvidia/nemotron-super-120b-a12b`, `nvidia/nvidia-nemotron-nano-9b-v2`
- **Headers:** `HTTP-Referer: https://lexsimple.vercel.app`, `X-Title: LexSimple`
