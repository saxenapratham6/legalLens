"""Draft Generator agent — rewrites clauses with user constraints."""

from agents.config.models import call_nemotron, NEMOTRON_SUPER
from agents.draft_generator.prompts import SYSTEM_PROMPT
from agents.orchestrator.state import LexSimpleState
from agents.tools.tool_schemas import DRAFT_CLAUSE_TOOL
import json


def run(state: LexSimpleState) -> dict:
    """
    Generate a revised clause based on user request.
    Returns original, proposed, change_summary, and risk_delta.
    """
    draft_request = state.get("draft_request", "")
    risk_flags = state.get("risk_flags", [])

    # Find the relevant flagged clause
    context = json.dumps(risk_flags, indent=2)

    response = call_nemotron(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": (
                f"User request: {draft_request}\n\n"
                f"Flagged clauses for reference:\n{context}"
            )},
        ],
        model=NEMOTRON_SUPER,
        tools=[DRAFT_CLAUSE_TOOL],
    )

    msg = response.choices[0].message
    draft_output = None

    if msg.tool_calls:
        args = json.loads(msg.tool_calls[0].function.arguments)
        draft_output = {
            "original": args.get("original", ""),
            "proposed": args.get("proposed", ""),
            "change_summary": args.get("change_summary", ""),
            "risk_delta": args.get("risk_delta", ""),
        }
    elif msg.content:
        try:
            draft_output = json.loads(msg.content)
        except json.JSONDecodeError:
            draft_output = {"raw": msg.content}

    return {
        "draft_output": draft_output,
        "draft_request": None,  # Clear to prevent re-triggering
    }
