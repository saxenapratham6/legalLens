"""Q&A agent — conversational document Q&A with clause citations."""

from agents.config.models import call_nemotron, NEMOTRON_SUPER
from agents.qa_agent.prompts import SYSTEM_PROMPT
from agents.orchestrator.state import LexSimpleState
import json


def run(state: LexSimpleState) -> dict:
    """
    Handle user questions about the document.
    Cites clause references and appends legal disclaimer.
    In negotiation mode, provides strategic negotiation advice.
    """
    chat_history = state.get("chat_history", [])
    report = state.get("report", {})
    negotiation_mode = state.get("negotiation_mode", False)

    # Build context from the report for grounding
    context = json.dumps(report, indent=2) if report else "No report available yet."

    # Modify system prompt based on negotiation mode
    system_content = SYSTEM_PROMPT.format(context=context)
    if negotiation_mode:
        system_content += (
            "\n\n**NEGOTIATION MODE ACTIVE**\n"
            "You are now acting as a negotiation advisor. When answering questions:\n"
            "1. Identify leverage points and weak spots in the contract\n"
            "2. Suggest specific language changes that favor the user\n"
            "3. Provide negotiation tactics (e.g., 'Request reciprocal clause', 'Propose cap on liability')\n"
            "4. Highlight industry-standard alternatives to unfavorable terms\n"
            "5. Recommend what to push back on vs. what to accept\n"
            "6. Frame responses as actionable negotiation strategies"
        )

    messages = [
        {"role": "system", "content": system_content},
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
