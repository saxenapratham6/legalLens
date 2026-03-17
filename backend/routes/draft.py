"""
/api/draft — Generate a revised clause based on user instructions.
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from agents.draft_generator.agent import run as draft_run

logger = logging.getLogger(__name__)
router = APIRouter()


class DraftRequest(BaseModel):
    instruction: str = Field(..., description="What the user wants changed")
    risk_flags: list[dict] = Field(default=[], description="Flagged clauses for context")


class DraftResponse(BaseModel):
    original: str
    proposed: str
    change_summary: str
    risk_delta: str


@router.post("/draft", response_model=DraftResponse)
async def generate_draft(request: DraftRequest):
    """Generate a revised clause based on user instructions."""
    try:
        result = draft_run({
            "draft_request": request.instruction,
            "risk_flags": request.risk_flags,
        })

        draft = result.get("draft_output")
        if not draft:
            raise HTTPException(status_code=422, detail="Could not generate a draft revision.")

        return DraftResponse(
            original=draft.get("original", ""),
            proposed=draft.get("proposed", ""),
            change_summary=draft.get("change_summary", ""),
            risk_delta=draft.get("risk_delta", ""),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Draft generation failed")
        raise HTTPException(status_code=500, detail=f"Draft generation failed: {str(e)}")
