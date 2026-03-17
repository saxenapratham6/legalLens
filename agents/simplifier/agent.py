"""Simplifier agent — rewrites legal text at 9th-grade reading level."""

from agents.config.models import call_nemotron, NEMOTRON_NANO
from agents.simplifier.prompts import SYSTEM_PROMPT
from agents.orchestrator.state import LexSimpleState
import json


def run(state: LexSimpleState) -> dict:
    """Simplify each chunk into plain English."""
    chunks = state.get("chunks", [])
    simplified: list[dict] = []

    for chunk in chunks:
        response = call_nemotron(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Simplify this legal clause:\n\n{chunk['text']}"},
            ],
            model=NEMOTRON_NANO,
            json_mode=True,
        )
        content = response.choices[0].message.content or "{}"
        try:
            data = json.loads(content)
            simplified.append({
                "section_title": data.get("section_title", f"Section {chunk.get('chunk_id', '?')}"),
                "original": chunk["text"],
                "simplified": data.get("simplified", content),
            })
        except json.JSONDecodeError:
            simplified.append({
                "section_title": f"Section {chunk.get('chunk_id', '?')}",
                "original": chunk["text"],
                "simplified": content,
            })

    return {"simplified": simplified}
