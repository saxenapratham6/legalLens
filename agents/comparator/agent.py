"""Comparator agent — benchmarks flagged clauses against market norms."""

from agents.config.models import call_nemotron, NEMOTRON_SUPER
from agents.comparator.prompts import SYSTEM_PROMPT
from agents.orchestrator.state import LexSimpleState
from agents.tools.tool_schemas import BENCHMARK_CLAUSE_TOOL
import json


def run(state: LexSimpleState) -> dict:
    """Compare flagged clauses to market norms; rate deviation."""
    risk_flags = state.get("risk_flags", [])
    facts = state.get("facts", [])
    doc_type = state.get("doc_type", "unknown")
    jurisdiction = state.get("jurisdiction", "unknown")
    comparisons: list[dict] = []

    # Only benchmark RED / AMBER flags
    flagged = [f for f in risk_flags if f.get("severity") in ("RED", "AMBER")]
    if not flagged:
        return {"comparisons": []}

    context = json.dumps({"flags": flagged, "facts": facts}, indent=2)

    response = call_nemotron(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT.format(
                doc_type=doc_type, jurisdiction=jurisdiction
            )},
            {"role": "user", "content": f"Benchmark these flagged clauses:\n\n{context}"},
        ],
        model=NEMOTRON_SUPER,
        tools=[BENCHMARK_CLAUSE_TOOL],
    )

    msg = response.choices[0].message
    if msg.tool_calls:
        for tc in msg.tool_calls:
            args = json.loads(tc.function.arguments)
            comparisons.append({
                "fact": args.get("fact_label", ""),
                "doc_value": args.get("doc_value", ""),
                "market_norm": args.get("market_norm", ""),
                "deviation": args.get("deviation", "LOW"),
                "notes": args.get("notes", ""),
            })

    return {"comparisons": comparisons}
