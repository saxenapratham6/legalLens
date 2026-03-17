"""
LexSimple Backend — FastAPI Application
Main entry point for the LegalLens backend API.
"""

import sys
import os
from pathlib import Path

# Ensure project root is on the Python path so `agents` package is importable
PROJECT_ROOT = str(Path(__file__).resolve().parent.parent)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from dotenv import load_dotenv
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.analyze import router as analyze_router
from backend.routes.chat import router as chat_router
from backend.routes.draft import router as draft_router

# ── App setup ─────────────────────────────────────────────────────────
app = FastAPI(
    title="LexSimple API",
    description="AI-powered legal document analysis — NVIDIA Nemotron × LangGraph",
    version="1.0.0",
)

# ── CORS — allow Vercel frontend ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://lexsimple.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────
app.include_router(analyze_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(draft_router, prefix="/api")


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "lexsimple-api"}
