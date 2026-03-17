"""
Agentic RAG — in-memory keyword store for clause precedent retrieval.
Used by the Risk Scanner when confidence < 0.8 on a RED/AMBER flag.

For hackathon simplicity, we use keyword matching instead of vector embeddings.
"""

_store: "SimpleStore | None" = None


def init_vectorstore(chunks: list[str]) -> None:
    """Build the in-memory store from document chunks. Called once at ingestion."""
    global _store
    _store = SimpleStore(chunks)


def retrieve_precedent(category: str, doc_type: str, k: int = 3) -> list[str]:
    """
    Retrieve similar clause examples. Called by the Risk Scanner agent.
    The agent decides WHEN to call this (agentic RAG).
    """
    if _store is None:
        return [f"No precedent store initialized. Category: {category}, Doc type: {doc_type}"]

    return _store.search(f"{category} clause {doc_type}", k)


class SimpleStore:
    """Lightweight keyword-based retrieval store."""

    def __init__(self, texts: list[str]):
        self.texts = texts

    def search(self, query: str, k: int = 3) -> list[str]:
        keywords = query.lower().split()
        scored = []
        for text in self.texts:
            score = sum(1 for kw in keywords if kw in text.lower())
            if score > 0:
                scored.append((score, text))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [t for _, t in scored[:k]]
