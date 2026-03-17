"""
Model configuration and OpenRouter client setup for LexSimple.
All Nemotron models are accessed via OpenRouter API.
"""

import os
import openai

# ---------------------------------------------------------------------------
# Model name constants
# ---------------------------------------------------------------------------
NEMOTRON_SUPER = "nvidia/nemotron-3-super-120b-a12b:free"
NEMOTRON_NANO  = "nvidia/nemotron-nano-9b-v2"

# ---------------------------------------------------------------------------
# OpenRouter client factory
# ---------------------------------------------------------------------------
def get_client() -> openai.OpenAI:
    """Return an OpenAI-compatible client pointing at OpenRouter."""
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise EnvironmentError(
            "OPENROUTER_API_KEY is not set. "
            "Export it before running: export OPENROUTER_API_KEY='your-key'"
        )
    return openai.OpenAI(
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
        default_headers={
            "HTTP-Referer": "https://lexsimple.vercel.app",
            "X-Title": "LexSimple",
        },
    )


def call_nemotron(
    messages: list[dict],
    model: str = NEMOTRON_SUPER,
    tools: list[dict] | None = None,
    json_mode: bool = False,
    temperature: float = 0.3,
) -> openai.types.chat.ChatCompletion:
    """
    Convenience wrapper to call a Nemotron model via OpenRouter.

    Args:
        messages:    Chat messages (system + user + assistant history).
        model:       Which Nemotron variant to use.
        tools:       Optional list of function-calling tool schemas.
        json_mode:   If True, force structured JSON output.
        temperature: Sampling temperature (lower = more deterministic).
    """
    client = get_client()
    kwargs: dict = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
    }
    if tools:
        kwargs["tools"] = tools
        kwargs["tool_choice"] = "auto"
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    return client.chat.completions.create(**kwargs)
