---
description: How to run the LexSimple backend server locally
---

# Run Backend Locally

// turbo-all

1. Create and activate a virtual environment:
```bash
cd /Users/manavsharma/legalLens && python3 -m venv .venv && source .venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set the OpenRouter API key:
```bash
export OPENROUTER_API_KEY="your-key-here"
```

4. Start the FastAPI server:
```bash
cd /Users/manavsharma/legalLens/backend && uvicorn main:app --reload --port 8000
```

5. Test the health endpoint:
```bash
curl http://localhost:8000/health
```

6. Test document analysis:
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "This lease agreement is entered into by Landlord and Tenant..."}'
```
