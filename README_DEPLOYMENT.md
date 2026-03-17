# Deploying LexSimple to Vercel

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **GitHub Repository**: Your code is already pushed to GitHub
3. **OpenRouter API Key**: You'll need this for environment variables

---

## Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from project root**:
   ```bash
   cd /Users/prathamsaxena/legalLens
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project? **No**
   - Project name: **lexsimple** (or your choice)
   - Directory: **.** (current directory)
   - Override settings? **No**

5. **Set environment variables**:
   ```bash
   vercel env add OPENROUTER_API_KEY
   ```
   Paste your API key when prompted.

6. **Deploy to production**:
   ```bash
   vercel --prod
   ```

---

### Option 2: Deploy via Vercel Dashboard

1. **Go to Vercel Dashboard**: https://vercel.com/new

2. **Import Git Repository**:
   - Click "Add New Project"
   - Select your GitHub repository: `saxenapratham6/legalLens`
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/.next`
   - **Install Command**: `npm install`

4. **Add Environment Variables**:
   Click "Environment Variables" and add:
   - **Name**: `OPENROUTER_API_KEY`
   - **Value**: Your OpenRouter API key
   - **Environment**: Production, Preview, Development (select all)

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete

---

## Important Notes

### ⚠️ Backend Limitations on Vercel

**Vercel has serverless function limits:**
- **Execution time**: 10 seconds (Hobby), 60 seconds (Pro)
- **Your analysis takes 2-3 minutes** → Will timeout on Vercel

### 🔧 Solutions

**Option A: Deploy Backend Separately (Recommended)**

Deploy backend to a platform that supports long-running processes:

1. **Railway.app** (Recommended):
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Deploy backend
   cd backend
   railway init
   railway up
   ```

2. **Render.com**:
   - Create new Web Service
   - Connect GitHub repo
   - Root Directory: `backend`
   - Build Command: `pip install -r ../requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Update Frontend API URL**:
   After deploying backend, update `frontend/.env.production`:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

**Option B: Use Vercel for Frontend Only**

1. Deploy only the frontend to Vercel
2. Keep backend running on your local machine or a VPS
3. Update `NEXT_PUBLIC_API_URL` to point to your backend

---

## Post-Deployment Checklist

- [ ] Frontend loads at your Vercel URL
- [ ] Backend API is accessible (check `/health` endpoint)
- [ ] File upload works
- [ ] Document analysis completes successfully
- [ ] Chat functionality works
- [ ] Negotiation mode toggle works
- [ ] History saves and loads correctly

---

## Troubleshooting

### Build Fails

**Error**: `Module not found`
- **Fix**: Make sure all dependencies are in `package.json`
- Run: `cd frontend && npm install`

### API Calls Fail

**Error**: `CORS error` or `Network error`
- **Fix**: Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend CORS allows your Vercel domain

### Analysis Times Out

**Error**: `Analysis timed out after 10 minutes`
- **Fix**: Deploy backend to Railway/Render (see above)
- Vercel serverless functions have strict time limits

---

## Environment Variables Reference

### Frontend (.env.production)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Backend (Vercel/Railway)
```
OPENROUTER_API_KEY=your_api_key_here
```

---

## Recommended Architecture

```
┌─────────────────┐
│  Vercel         │
│  (Frontend)     │ ← User visits here
│  Next.js        │
└────────┬────────┘
         │
         │ API calls
         ▼
┌─────────────────┐
│  Railway/Render │
│  (Backend)      │ ← Long-running analysis
│  FastAPI        │
└─────────────────┘
```

This separates concerns and avoids Vercel's serverless timeout limits.

---

## Quick Deploy Commands

```bash
# Frontend to Vercel
cd /Users/prathamsaxena/legalLens
vercel --prod

# Backend to Railway
cd backend
railway login
railway init
railway up

# Update frontend API URL
echo "NEXT_PUBLIC_API_URL=https://your-backend.railway.app" > frontend/.env.production

# Redeploy frontend with new API URL
vercel --prod
```

---

For questions or issues, refer to:
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
