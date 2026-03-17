"""Classifier agent — detects document type, jurisdiction, and party roles."""

from agents.config.models import call_nemotron, NEMOTRON_NANO
from agents.classifier.prompts import SYSTEM_PROMPT
from agents.orchestrator.state import LexSimpleState
from agents.tools.tool_schemas import CLASSIFY_DOCUMENT_TOOL
import json


def run(state: LexSimpleState) -> dict:
    """
    Classify the uploaded document.
    Returns: doc_type, jurisdiction, party_roles, confidence.
    """
    text_preview = state["raw_text"][:4000]  # first ~4k chars is enough

    response = call_nemotron(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Classify this legal document:\n\n{text_preview}"},
        ],
        model=NEMOTRON_NANO,
        tools=[CLASSIFY_DOCUMENT_TOOL],
    )

    # Extract tool call result
    msg = response.choices[0].message
    if msg.tool_calls:
        args = json.loads(msg.tool_calls[0].function.arguments)
        return {
            "doc_type": args.get("doc_type", "unknown"),
            "jurisdiction": args.get("jurisdiction", "unknown"),
            "party_roles": args.get("party_roles", {}),
            "confidence": args.get("confidence", 0.0),
        }

    # Fallback: try to parse JSON from content
    try:
        data = json.loads(msg.content)
        return {
            "doc_type": data.get("doc_type", "unknown"),
            "jurisdiction": data.get("jurisdiction", "unknown"),
            "party_roles": data.get("party_roles", {}),
            "confidence": data.get("confidence", 0.0),
        }
    except (json.JSONDecodeError, TypeError):
        return {"doc_type": "unknown", "jurisdiction": "unknown", "party_roles": {}, "confidence": 0.0}
