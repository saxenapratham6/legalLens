"""
LexSimpleState — shared state object passed between all LangGraph nodes.
Every agent reads from and writes to this TypedDict.
"""

from typing import TypedDict


class LexSimpleState(TypedDict, total=False):
    # ── Ingestion ──────────────────────────────────────────────────────
    raw_text: str
    chunks: list[dict]  # [{chunk_id, text, start_char, end_char}]

    # ── Classifier output ──────────────────────────────────────────────
    doc_type: str
    jurisdiction: str
    party_roles: dict
    confidence: float

    # ── Analysis outputs ───────────────────────────────────────────────
    simplified: list[dict]      # [{section_title, original, simplified}]
    risk_flags: list[dict]      # [{clause_ref, severity, category, headline, explanation, suggestion}]
    facts: list[dict]           # [{label, value, clause_ref, category}]
    comparisons: list[dict]     # [{fact, doc_value, market_norm, deviation, notes}]
    report: dict                # Full structured report

    # ── Session ────────────────────────────────────────────────────────
    chat_history: list[dict]
    draft_request: str | None
    draft_output: dict | None
