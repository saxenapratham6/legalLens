"""
Risk Scanner agent — flagship ReAct loop using Nemotron Super.
Reason → Act (score_risk) → Observe → optionally Retrieve → Re-reason → Final score.
"""

from agents.config.models import call_nemotron, NEMOTRON_SUPER
from agents.risk_scanner.prompts import SYSTEM_PROMPT
from agents.risk_scanner.taxonomy import RISK_TAXONOMY_TEXT
from agents.orchestrator.state import LexSimpleState
from agents.tools.tool_schemas import SCORE_RISK_TOOL, RETRIEVE_PRECEDENT_TOOL, MARK_STANDARD_TOOL
import json


def run(state: LexSimpleState) -> dict:
    """
    ReAct loop: iterate over document chunks, reason about risk,
    call score_risk / retrieve_precedent tools as needed.
    """
    chunks = state.get("chunks", [])
    doc_type = state.get("doc_type", "unknown")
    jurisdiction = state.get("jurisdiction", "unknown")

    # Use dict keyed on (clause_ref, category) to deduplicate flags
    # Later assessments (after RAG retrieval) replace earlier ones
    flags_by_key: dict[tuple[str, str], dict] = {}

    tools = [SCORE_RISK_TOOL, RETRIEVE_PRECEDENT_TOOL, MARK_STANDARD_TOOL]

    for chunk in chunks:
        prompt = SYSTEM_PROMPT.format(
            jurisdiction=jurisdiction,
            doc_type=doc_type,
            taxonomy=RISK_TAXONOMY_TEXT,
        )

        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"Analyze this clause for risks:\n\n{chunk['text']}"},
        ]

        # ReAct loop — allow up to 3 iterations per chunk
        for _ in range(3):
            response = call_nemotron(messages=messages, model=NEMOTRON_SUPER, tools=tools)
            msg = response.choices[0].message

            if not msg.tool_calls:
                break  # No more tool calls — agent is done with this chunk

            for tool_call in msg.tool_calls:
                fn_name = tool_call.function.name
                try:
                    args = json.loads(tool_call.function.arguments)
                except json.JSONDecodeError:
                    continue

                if fn_name == "score_risk":
                    flag = {
                        "clause_ref": args.get("clause_ref", chunk.get("chunk_id", "")),
                        "severity": args.get("severity", "GREEN"),
                        "category": args.get("category", ""),
                        "headline": args.get("headline", ""),
                        "explanation": args.get("explanation", ""),
                        "suggestion": args.get("suggestion", ""),
                    }
                    # Dedup key: (clause_ref, category) — later calls overwrite
                    key = (flag["clause_ref"], flag["category"])
                    flags_by_key[key] = flag

                elif fn_name == "retrieve_precedent":
                    from agents.tools.rag import retrieve_precedent
                    precedents = retrieve_precedent(
                        args.get("category", ""), args.get("doc_type", doc_type)
                    )
                    # Feed precedents back for re-reasoning
                    messages.append({"role": "assistant", "content": msg.content or ""})
                    messages.append({
                        "role": "user",
                        "content": f"Precedent clauses retrieved:\n{json.dumps(precedents)}\nRevise your assessment if needed.",
                    })
                elif fn_name == "mark_standard":
                    pass  # GREEN — no flag to record

    # Sort: RED → AMBER → GREEN
    severity_order = {"RED": 0, "AMBER": 1, "GREEN": 2}
    risk_flags = sorted(
        flags_by_key.values(),
        key=lambda f: severity_order.get(f["severity"], 3),
    )

    return {"risk_flags": risk_flags}
