"""
Document parsers — extract text from PDF, DOCX, and TXT files,
then chunk into overlapping windows for LLM processing.
"""

from __future__ import annotations
from agents.orchestrator.state import LexSimpleState


def ingest_and_chunk(state: LexSimpleState) -> dict:
    """
    LangGraph node: take raw_text from state and split into chunks.
    800-token windows with 150-token overlap (per PRD spec).
    """
    raw_text = state.get("raw_text", "")
    chunks = chunk_text(raw_text, window=800, overlap=150)
    return {"chunks": chunks}


def chunk_text(text: str, window: int = 800, overlap: int = 150) -> list[dict]:
    """
    Split text into overlapping token-approximate chunks.
    Uses whitespace-based word splitting as a fast approximation of tokens.
    """
    words = text.split()
    chunks = []
    start = 0
    chunk_id = 0

    while start < len(words):
        end = min(start + window, len(words))
        chunk_words = words[start:end]
        chunk_text = " ".join(chunk_words)
        chunks.append({
            "chunk_id": f"chunk_{chunk_id}",
            "text": chunk_text,
            "start_word": start,
            "end_word": end,
        })
        chunk_id += 1
        start += window - overlap

    return chunks


def extract_text_from_pdf(filepath: str) -> str:
    """Extract text from a PDF file using pdfplumber."""
    import pdfplumber
    text_parts = []
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n\n".join(text_parts)


def extract_text_from_docx(filepath: str) -> str:
    """Extract text from a DOCX file."""
    try:
        import docx
        doc = docx.Document(filepath)
        return "\n\n".join(para.text for para in doc.paragraphs if para.text.strip())
    except ImportError:
        # Fallback: use textutil on macOS
        import subprocess
        result = subprocess.run(
            ["textutil", "-convert", "txt", "-stdout", filepath],
            capture_output=True, text=True,
        )
        return result.stdout


def extract_text(filepath: str) -> str:
    """Auto-detect file type and extract text."""
    ext = filepath.rsplit(".", 1)[-1].lower()
    if ext == "pdf":
        return extract_text_from_pdf(filepath)
    elif ext in ("docx", "doc"):
        return extract_text_from_docx(filepath)
    elif ext == "txt":
        with open(filepath) as f:
            return f.read()
    else:
        raise ValueError(f"Unsupported file type: .{ext}")
