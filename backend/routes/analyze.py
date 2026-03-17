"""
/api/analyze — Upload document text → run full analysis pipeline → return report.
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from agents.tools.parsers import chunk_text
from agents.tools.rag import init_vectorstore
from agents.classifier.agent import run as classify
from agents.simplifier.agent import run as simplify
from agents.risk_scanner.agent import run as risk_scan
from agents.extractor.agent import run as extract
from agents.comparator.agent import run as compare
from agents.report_builder.agent import run as build_report

logger = logging.getLogger(__name__)
router = APIRouter()


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Raw document text to analyze")


class AnalyzeResponse(BaseModel):
    doc_type: str
    jurisdiction: str
    party_roles: dict
    confidence: float
    risk_flags: list[dict]
    facts: list[dict]
    simplified: list[dict]
    comparisons: list[dict]
    report: dict


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_document(request: AnalyzeRequest):
    """
    Run the full LexSimple analysis pipeline on a document.
    Pipeline: Chunk → Classify → [Simplify | Risk Scan | Extract] → Compare → Report
    """
    try:
        # Validate input text is readable (not binary data)
        import re
        readable_chars = len(re.findall(r'[a-zA-Z0-9\s]', request.text))
        total_chars = len(request.text)
        
        if total_chars == 0:
            raise HTTPException(status_code=400, detail="Document is empty")
        
        if total_chars > 0 and readable_chars / total_chars < 0.5:
            raise HTTPException(
                status_code=400, 
                detail="Document appears to contain corrupted or binary data. Please upload a valid text-based document (PDF, DOCX, or TXT)."
            )
        
        # Step 1: Chunk the document
        chunks = chunk_text(request.text)
        chunk_texts = [c["text"] for c in chunks]
        init_vectorstore(chunk_texts)

        state: dict = {"raw_text": request.text, "chunks": chunks}

        # Step 2: Classify
        logger.info("Running classifier...")
        state.update(classify(state))

        # Step 3: Parallel analysis (sequential for simplicity)
        logger.info("Running simplifier...")
        state.update(simplify(state))

        logger.info("Running risk scanner...")
        state.update(risk_scan(state))

        logger.info("Running extractor...")
        state.update(extract(state))

        # Step 4: Compare (needs risk_flags + facts)
        logger.info("Running comparator...")
        state.update(compare(state))

        # Step 5: Build report
        logger.info("Running report builder...")
        state.update(build_report(state))

        return AnalyzeResponse(
            doc_type=state.get("doc_type", "unknown"),
            jurisdiction=state.get("jurisdiction", "unknown"),
            party_roles=state.get("party_roles", {}),
            confidence=state.get("confidence", 0.0),
            risk_flags=state.get("risk_flags", []),
            facts=state.get("facts", []),
            simplified=state.get("simplified", []),
            comparisons=state.get("comparisons", []),
            report=state.get("report", {}),
        )

    except Exception as e:
        logger.exception("Analysis pipeline failed")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
