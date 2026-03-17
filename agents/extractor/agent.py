"""Extractor agent — pulls structured facts from legal documents."""

from agents.config.models import call_nemotron, NEMOTRON_NANO
from agents.extractor.prompts import SYSTEM_PROMPT
from agents.orchestrator.state import LexSimpleState
from agents.tools.tool_schemas import EXTRACT_FACT_TOOL
import json


def run(state: LexSimpleState) -> dict:
    """Extract structured facts (payments, dates, parties, obligations)."""
    chunks = state.get("chunks", [])
    facts: list[dict] = []

    for chunk in chunks:
        response = call_nemotron(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Extract all facts from this clause:\n\n{chunk['text']}"},
            ],
            model=NEMOTRON_NANO,
            tools=[EXTRACT_FACT_TOOL],
        )

        msg = response.choices[0].message
        if msg.tool_calls:
            for tc in msg.tool_calls:
                args = json.loads(tc.function.arguments)
                facts.append({
                    "label": args.get("label", ""),
                    "value": args.get("value"),
                    "clause_ref": args.get("clause_ref", chunk.get("chunk_id", "")),
                    "category": args.get("category", ""),
                })

    return {"facts": facts}
