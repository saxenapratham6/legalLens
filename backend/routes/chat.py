"""
/api/chat — Conversational Q&A about the analyzed document.
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from agents.qa_agent.agent import run as qa_run

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory session store (hackathon — no persistence needed)
_sessions: dict[str, dict] = {}


class ChatRequest(BaseModel):
    session_id: str = Field(..., description="Session identifier")
    message: str = Field(..., min_length=1, description="User's question")
    report: dict = Field(default={}, description="Analysis report for grounding")
    negotiation_mode: bool = Field(default=False, description="Enable AI-powered negotiation suggestions")


class ChatResponse(BaseModel):
    answer: str
    session_id: str


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a question about the analyzed document."""
    try:
        session = _sessions.get(request.session_id, {
            "chat_history": [],
            "report": request.report,
        })

        session["chat_history"].append({"role": "user", "content": request.message})

        result = qa_run({
            "chat_history": session["chat_history"],
            "report": session.get("report", request.report),
            "negotiation_mode": request.negotiation_mode,
        })

        session["chat_history"] = result.get("chat_history", session["chat_history"])
        _sessions[request.session_id] = session

        assistant_msgs = [m for m in session["chat_history"] if m["role"] == "assistant"]
        answer = assistant_msgs[-1]["content"] if assistant_msgs else "I couldn't process that."

        return ChatResponse(answer=answer, session_id=request.session_id)

    except Exception as e:
        logger.exception("Chat failed")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
