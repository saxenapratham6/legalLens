"""Report Builder agent — synthesizes all agent outputs into a 6-section report."""

from agents.config.models import call_nemotron, NEMOTRON_SUPER
from agents.report_builder.prompts import SYSTEM_PROMPT
from agents.orchestrator.state import LexSimpleState
import json


def run(state: LexSimpleState) -> dict:
    """Synthesize risk_flags, facts, simplified, and comparisons into a report."""
    context = json.dumps({
        "doc_type": state.get("doc_type", "unknown"),
        "risk_flags": state.get("risk_flags", []),
        "facts": state.get("facts", []),
        "simplified": state.get("simplified", []),
        "comparisons": state.get("comparisons", []),
    }, indent=2)

    response = call_nemotron(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Build the analysis report from these agent outputs:\n\n{context}"},
        ],
        model=NEMOTRON_SUPER,
        json_mode=True,
    )

    content = response.choices[0].message.content or "{}"
    try:
        report = json.loads(content)
    except json.JSONDecodeError:
        report = {"raw": content}

    return {"report": report}
