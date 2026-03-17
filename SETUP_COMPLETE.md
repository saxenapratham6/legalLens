# LexSimple - Setup Complete ✅

## What's Been Done

1. ✅ Renamed frontend folder from `b_hLNPY771eXy-1773706036097` to `frontend`
2. ✅ Created API client at `frontend/lib/api-client.ts`
3. ✅ Updated `frontend/app/page.tsx` to use real backend API instead of mocks
4. ✅ Backend server running on `http://localhost:8000`
5. ✅ Python virtual environment created with all dependencies installed

## Next Steps

### 1. Configure OpenRouter API Key

Edit `.env` in the project root and add your API key:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install -g pnpm
pnpm install
```

### 3. Start Frontend Server

```bash
cd frontend
pnpm dev
```

Frontend will run on: `http://localhost:3000`

## Testing the Integration

1. Open `http://localhost:3000` in your browser
2. Upload or paste a legal document
3. Watch the real AI agents process it (not mock data!)
4. Try the chat feature to ask questions
5. Use "Suggest Fix" to generate revised clauses

## API Endpoints

- **Backend**: `http://localhost:8000`
  - Health: `GET /health`
  - Analyze: `POST /api/analyze`
  - Chat: `POST /api/chat`
  - Draft: `POST /api/draft`

- **Frontend**: `http://localhost:3000`

## Architecture

```
Frontend (React/Next.js) → API Client → Backend (FastAPI) → NVIDIA Nemotron
     ↓                                        ↓
  localhost:3000                        localhost:8000
```

## Key Changes Made

### Frontend Integration
- Replaced `generateMockAnalysis()` with `apiClient.analyze()`
- Chat now calls `apiClient.chat()` with real backend
- Added progress tracking during API calls
- Error handling for failed API requests

### API Response Mapping
Backend uses snake_case (Python), frontend uses camelCase (TypeScript).
The integration layer transforms:
- `doc_type` → `docType`
- `risk_flags` → `riskFlags`
- `clause_ref` → `clauseRef`
- etc.

## Troubleshooting

**Backend not responding?**
- Check `.env` has valid `OPENROUTER_API_KEY`
- Verify backend is running: `curl http://localhost:8000/health`

**Frontend build errors?**
- Run `pnpm install` in the `frontend/` directory
- Check `node_modules` exists

**CORS errors?**
- Backend already configured for `localhost:3000`
- Check browser console for details

## Demo Flow

1. Upload sample lease agreement
2. Backend runs 5 agents: Classifier → Risk Scanner → Extractor → Simplifier → Report Builder
3. Frontend displays:
   - Risk dashboard (RED/AMBER/GREEN flags)
   - Extracted facts table
   - Plain-English summary
   - Chat interface
4. Ask questions in chat → backend QA agent responds with clause citations
5. Click "Suggest Fix" → backend draft generator rewrites problematic clauses
