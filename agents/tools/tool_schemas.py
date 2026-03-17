"""
Centralized JSON tool schemas for Nemotron function-calling.
Each schema follows the OpenAI tools format for use with the OpenRouter API.
"""

CLASSIFY_DOCUMENT_TOOL = {
    "type": "function",
    "function": {
        "name": "classify_document",
        "description": "Classify a legal document by type, jurisdiction, and party roles.",
        "parameters": {
            "type": "object",
            "properties": {
                "doc_type": {
                    "type": "string",
                    "enum": [
                        "lease", "employment_contract", "NDA", "SaaS_terms",
                        "loan_agreement", "insurance_policy", "service_agreement",
                        "consulting_contract", "equity_agreement", "medical_consent",
                        "privacy_policy", "partnership_agreement",
                    ],
                    "description": "The type of legal document.",
                },
                "jurisdiction": {"type": "string", "description": "State or country governing law, if detectable."},
                "party_roles": {
                    "type": "object",
                    "description": "Mapping of roles, e.g. {'landlord': 'ABC Corp', 'tenant': 'John Doe'}.",
                },
                "confidence": {"type": "number", "description": "Confidence score 0.0–1.0."},
            },
            "required": ["doc_type", "confidence"],
        },
    },
}

SCORE_RISK_TOOL = {
    "type": "function",
    "function": {
        "name": "score_risk",
        "description": "Record a risk flag for a clause.",
        "parameters": {
            "type": "object",
            "properties": {
                "clause_ref": {"type": "string", "description": "Clause reference (e.g. 'Section 4.2')."},
                "severity": {"type": "string", "enum": ["RED", "AMBER", "GREEN"], "description": "Risk severity."},
                "category": {"type": "string", "description": "Risk category from the taxonomy."},
                "headline": {"type": "string", "description": "≤12 word headline describing the risk."},
                "explanation": {"type": "string", "description": "Plain-English explanation for a non-lawyer."},
                "suggestion": {"type": "string", "description": "Actionable negotiation suggestion."},
            },
            "required": ["clause_ref", "severity", "category", "headline", "explanation"],
        },
    },
}

RETRIEVE_PRECEDENT_TOOL = {
    "type": "function",
    "function": {
        "name": "retrieve_precedent",
        "description": "Retrieve similar clause examples from the knowledge base. Call only when confidence < 0.8.",
        "parameters": {
            "type": "object",
            "properties": {
                "category": {"type": "string", "description": "Risk category to search for."},
                "doc_type": {"type": "string", "description": "Document type for context."},
            },
            "required": ["category", "doc_type"],
        },
    },
}

MARK_STANDARD_TOOL = {
    "type": "function",
    "function": {
        "name": "mark_standard",
        "description": "Mark a clause as standard/expected (GREEN) for this document type.",
        "parameters": {
            "type": "object",
            "properties": {
                "clause_ref": {"type": "string", "description": "Clause reference."},
                "note": {"type": "string", "description": "Brief note on why this is standard."},
            },
            "required": ["clause_ref"],
        },
    },
}

EXTRACT_FACT_TOOL = {
    "type": "function",
    "function": {
        "name": "extract_fact",
        "description": "Extract a structured fact from a legal clause.",
        "parameters": {
            "type": "object",
            "properties": {
                "label": {"type": "string", "description": "Fact label (e.g. 'Monthly Rent')."},
                "value": {"type": "string", "description": "Fact value. Use null if not stated.", "nullable": True},
                "clause_ref": {"type": "string", "description": "Clause reference."},
                "category": {
                    "type": "string",
                    "enum": ["payment", "date", "party", "obligation", "jurisdiction", "termination"],
                    "description": "Fact category.",
                },
            },
            "required": ["label", "category"],
        },
    },
}

BENCHMARK_CLAUSE_TOOL = {
    "type": "function",
    "function": {
        "name": "benchmark_clause",
        "description": "Compare a flagged clause value to the market norm.",
        "parameters": {
            "type": "object",
            "properties": {
                "fact_label": {"type": "string", "description": "What is being compared."},
                "doc_value": {"type": "string", "description": "What the document says."},
                "market_norm": {"type": "string", "description": "What the standard expectation is."},
                "deviation": {"type": "string", "enum": ["LOW", "MEDIUM", "HIGH"], "description": "Deviation level."},
                "notes": {"type": "string", "description": "Jurisdiction-specific enforceability concerns."},
            },
            "required": ["fact_label", "doc_value", "market_norm", "deviation"],
        },
    },
}

DRAFT_CLAUSE_TOOL = {
    "type": "function",
    "function": {
        "name": "draft_clause",
        "description": "Generate a revised clause with change summary and risk delta.",
        "parameters": {
            "type": "object",
            "properties": {
                "original": {"type": "string", "description": "Original clause text."},
                "proposed": {"type": "string", "description": "Proposed revised clause text."},
                "change_summary": {"type": "string", "description": "One-sentence summary of changes."},
                "risk_delta": {"type": "string", "description": "How the revision changes the risk profile."},
            },
            "required": ["original", "proposed", "change_summary", "risk_delta"],
        },
    },
}

# All tools in one list for convenience
ALL_TOOLS = [
    CLASSIFY_DOCUMENT_TOOL,
    SCORE_RISK_TOOL,
    RETRIEVE_PRECEDENT_TOOL,
    MARK_STANDARD_TOOL,
    EXTRACT_FACT_TOOL,
    BENCHMARK_CLAUSE_TOOL,
    DRAFT_CLAUSE_TOOL,
]
