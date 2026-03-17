"""
LangGraph StateGraph definition — wires all agents into the pipeline.
"""

from langgraph.graph import StateGraph, START, END

from agents.orchestrator.state import LexSimpleState
from agents.classifier.agent import run as classify
from agents.simplifier.agent import run as simplify
from agents.risk_scanner.agent import run as risk_scan
from agents.extractor.agent import run as extract
from agents.comparator.agent import run as compare
from agents.report_builder.agent import run as build_report
from agents.qa_agent.agent import run as qa
from agents.draft_generator.agent import run as draft_gen
from agents.tools.parsers import ingest_and_chunk


# ── Route user action from Q&A ────────────────────────────────────────
def route_user_action(state: LexSimpleState) -> str:
    """Decide whether the user wants a draft or wants to keep chatting."""
    if state.get("draft_request"):
        return "draft"
    return "continue"


# ── Build the graph ───────────────────────────────────────────────────
def build_graph() -> StateGraph:
    graph = StateGraph(LexSimpleState)

    # Nodes
    graph.add_node("ingest", ingest_and_chunk)
    graph.add_node("classify", classify)
    graph.add_node("simplify", simplify)
    graph.add_node("risk_scan", risk_scan)
    graph.add_node("extract", extract)
    graph.add_node("compare", compare)
    graph.add_node("build_report", build_report)
    graph.add_node("qa_agent", qa)
    graph.add_node("draft_gen", draft_gen)

    # Edges — linear start
    graph.add_edge(START, "ingest")
    graph.add_edge("ingest", "classify")

    # Parallel fan-out from classifier
    graph.add_edge("classify", "simplify")
    graph.add_edge("classify", "risk_scan")
    graph.add_edge("classify", "extract")

    # Comparator waits for both risk_scan + extract
    graph.add_edge("risk_scan", "compare")
    graph.add_edge("extract", "compare")

    # Report builder waits for simplify + compare
    graph.add_edge("simplify", "build_report")
    graph.add_edge("compare", "build_report")

    # Q&A follows report
    graph.add_edge("build_report", "qa_agent")

    # Conditional: draft or continue chatting
    graph.add_conditional_edges(
        "qa_agent",
        route_user_action,
        {"draft": "draft_gen", "continue": END},
    )
    graph.add_edge("draft_gen", "qa_agent")

    return graph


def compile_app():
    """Compile and return the runnable LangGraph app."""
    return build_graph().compile()
