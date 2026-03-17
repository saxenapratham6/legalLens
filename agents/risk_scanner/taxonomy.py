"""
Risk flag taxonomy — embedded in the Risk Scanner's system prompt.
Defines the categories, severities, and detection patterns Nemotron looks for.
"""

RISK_TAXONOMY = [
    {"category": "Auto-renewal trap",              "severity": "RED",   "pattern": "Renewal is automatic; notice window <30 days."},
    {"category": "Unilateral amendment",            "severity": "RED",   "pattern": "'Reserves the right to modify', 'at our sole discretion' — only one party can change terms."},
    {"category": "Asymmetric indemnification",      "severity": "RED",   "pattern": "User indemnifies provider broadly; provider's indemnification is absent or narrower."},
    {"category": "IP overreach / work-for-hire",    "severity": "RED",   "pattern": "All IP assigned to other party, including pre-existing work."},
    {"category": "Excessive non-compete",           "severity": "RED",   "pattern": "Duration >12 months OR no geographic limit OR overly broad scope."},
    {"category": "Jury trial / class action waiver","severity": "RED",   "pattern": "Mandatory binding arbitration; waiver of jury trial or class action."},
    {"category": "Deposit forfeiture — vague",      "severity": "RED",   "pattern": "Conditions for withholding deposit are undefined or grant sole discretion."},
    {"category": "Hidden fees",                     "severity": "RED",   "pattern": "Fees only in schedules/exhibits not referenced in main clause. No cap."},
    {"category": "Penalty interest rate",           "severity": "RED",   "pattern": "Late payment interest exceeds 18% APR or jurisdictional usury limit."},
    {"category": "Data monetization",               "severity": "RED",   "pattern": "User data shared/sold to third parties for commercial purposes."},
    {"category": "Asymmetric termination",          "severity": "AMBER", "pattern": "One party terminates for convenience; other requires cause."},
    {"category": "Short notice periods",            "severity": "AMBER", "pattern": "Any notice period <14 days for material changes."},
    {"category": "Vague deliverables",              "severity": "AMBER", "pattern": "Scope undefined or subject to unilateral change; no acceptance criteria."},
    {"category": "Broad force majeure",             "severity": "AMBER", "pattern": "Broad enough to excuse performance for routine disruptions."},
    {"category": "Liquidated damages",              "severity": "AMBER", "pattern": "Fixed penalty disproportionate to actual likely harm."},
    {"category": "Jurisdiction — unusual",          "severity": "AMBER", "pattern": "Governing law in state/country unfavorable to user."},
    {"category": "Standard renewal 60d+",           "severity": "GREEN", "pattern": "Auto-renewal with ≥60 days notice. Expected."},
    {"category": "Standard mutual NDA",             "severity": "GREEN", "pattern": "Mutual confidentiality with standard carve-outs."},
    {"category": "Standard limitation of liability","severity": "GREEN", "pattern": "Both parties capped at fees paid; excludes gross negligence."},
]

# Pre-formatted text version for prompt injection
RISK_TAXONOMY_TEXT = "\n".join(
    f"- [{t['severity']}] {t['category']}: {t['pattern']}" for t in RISK_TAXONOMY
)
