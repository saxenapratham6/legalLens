"""
Document parsers — extract text from PDF, DOCX, and TXT files,
then chunk into overlapping windows for LLM processing.
"""

from __future__ import annotations
from agents.orchestrator.state import LexSimpleState


def ingest_and_chunk(state: LexSimpleState) -> dict:
    """
    LangGraph node: take raw_text from state and split into chunks.
    800-token windows with 150-token overlap for faster processing.
    """
    raw_text = state.get("raw_text", "")
    chunks = chunk_text(raw_text, window=800, overlap=150)
    return {"chunks": chunks}


def chunk_text(text: str, window: int = 800, overlap: int = 150) -> list[dict]:
    """
    Split text into overlapping token-approximate chunks.
    Uses character count with ~4 chars per token estimation (better for legal text).
    Optimized chunk size of 800 tokens (~3200 chars) for faster processing.
    """
    # Approximate: 1 token ≈ 4 characters for English text
    chars_per_token = 4
    chunk_size_chars = window * chars_per_token
    overlap_chars = overlap * chars_per_token
    
    chunks = []
    start = 0
    chunk_id = 0
    text_length = len(text)

    while start < text_length:
        end = min(start + chunk_size_chars, text_length)
        
        # Try to break at sentence boundaries for cleaner chunks
        if end < text_length:
            # Look for sentence ending within last 500 chars
            search_start = max(start, end - 500)
            last_period = text.rfind('. ', search_start, end)
            last_newline = text.rfind('\n\n', search_start, end)
            
            # Use the closest sentence/paragraph boundary
            boundary = max(last_period, last_newline)
            if boundary > start:
                end = boundary + 1
        
        chunk_text = text[start:end].strip()
        
        if chunk_text:  # Only add non-empty chunks
            chunks.append({
                "chunk_id": f"chunk_{chunk_id}",
                "text": chunk_text,
                "start_char": start,
                "end_char": end,
                "estimated_tokens": len(chunk_text) // chars_per_token,
            })
            chunk_id += 1
        
        start = end - overlap_chars if end < text_length else text_length

    return chunks


def extract_text_from_pdf(filepath: str) -> str:
    """Extract text from a PDF file using pdfplumber."""
    import pdfplumber
    import re
    
    text_parts = []
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                # Filter out binary/corrupted data
                # Remove non-printable characters except newlines and tabs
                cleaned = re.sub(r'[^\x20-\x7E\n\t]', '', page_text)
                
                # Only add if it contains actual readable text (not just whitespace/symbols)
                if cleaned.strip() and len(re.findall(r'[a-zA-Z]', cleaned)) > 10:
                    text_parts.append(cleaned)
    
    if not text_parts:
        raise ValueError("No readable text found in PDF. The file may be corrupted, image-based, or encrypted.")
    
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
