"""Q&A agent — conversational document Q&A with clause citations."""

from agents.config.models import call_nemotron, NEMOTRON_SUPER
from agents.qa_agent.prompts import SYSTEM_PROMPT
from agents.orchestrator.state import LexSimpleState
import json


def run(state: LexSimpleState) -> dict:
    """
    Handle user questions about the document.
    Cites clause references and appends legal disclaimer.
    """
    chat_history = state.get("chat_history", [])
    report = state.get("report", {})

    # Build context from the report for grounding
    context = json.dumps(report, indent=2) if report else "No report available yet."

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT.format(context=context)},
    ]
    messages.extend(chat_history)

    response = call_nemotron(
        messages=messages,
        model=NEMOTRON_SUPER,
    )

    answer = response.choices[0].message.content or ""

    # Append disclaimer if not already present
    disclaimer = (
        "\n\n*This is not legal advice. "
        "For high-stakes decisions, please consult a licensed attorney.*"
    )
    if "not legal advice" not in answer.lower():
        answer += disclaimer

    # Detect if user wants a draft
    draft_request = None
    draft_keywords = ["suggest a fix", "rewrite", "revise", "draft", "change the clause"]
    last_user_msg = chat_history[-1]["content"].lower() if chat_history else ""
    if any(kw in last_user_msg for kw in draft_keywords):
        draft_request = last_user_msg

    return {
        "chat_history": chat_history + [{"role": "assistant", "content": answer}],
        "draft_request": draft_request,
    }
