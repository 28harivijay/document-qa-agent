# DocuMind — AI Document Q&A

DocuMind is a full-stack app that lets you upload a document and chat with it. It uses a FastAPI + FAISS retrieval backend and a React/Vite frontend to answer questions grounded in your PDF, DOCX, or XLSX content.

🔗 Live demo: [document-qa-agent.vercel.app](https://document-qa-agent.vercel.app)

## Features

- Upload a document and ask questions in a chat-style UI
- Supports **PDF**, **DOCX**, and **XLSX**
- Retrieval-Augmented Generation (RAG) flow:
  - document parsing
  - chunking
  - Gemini embeddings
  - FAISS similarity search
  - Groq answer generation (`openai/gpt-oss-20b`)
- Simple REST API (`/upload`, `/ask`, `/` health check)

## Supported file types

- `.pdf`
- `.docx`
- `.xlsx`

## Architecture / data flow

1. Frontend uploads a file to `POST /upload`.
2. Backend saves it temporarily and loads text with format-specific loader logic.
3. Text is chunked (`RecursiveCharacterTextSplitter`).
4. Chunks are embedded with Gemini embeddings (`models/gemini-embedding-001`).
5. Vectors are indexed in FAISS.
6. Frontend sends questions to `POST /ask`.
7. Backend retrieves top-k relevant chunks (`k=3`) and asks Groq model `openai/gpt-oss-20b` for the final answer.

## Repository structure

```text
.
├── backend/
│   ├── main.py              # FastAPI app and API routes
│   ├── rag_pipeline.py      # loading, chunking, embeddings, retrieval, answering
│   ├── requirements.txt     # Python dependencies
│   └── Procfile             # web: uvicorn main:app --host 0.0.0.0 --port $PORT
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx # document upload flow
│   │   │   └── ChatPage.jsx # chat/ask flow
│   ├── package.json         # npm scripts (dev/build/lint/preview)
│   └── vercel.json          # Vercel build/install commands
└── README.md
```

## Prerequisites

- **Node.js + npm** (for frontend)
- **Python 3.10+ + pip** (for backend)
- API keys:
  - `GROQ_API_KEY`
  - `GEMINI_API_KEY`
- FAISS note:
  - Backend depends on `faiss-cpu`.
  - Use a Python version/platform that has compatible `faiss-cpu` wheels (Linux/macOS/WSL is typically easiest).

## Local development setup

### 1) Backend (Terminal A)

```bash
cd /home/runner/work/document-qa-agent/document-qa-agent/backend

python -m venv .venv
source .venv/bin/activate  # Windows (PowerShell): .venv\Scripts\Activate.ps1

pip install --upgrade pip
pip install -r requirements.txt
```

Create `backend/.env`:

```env
GROQ_API_KEY=your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here
```

Run backend:

```bash
uvicorn main:app --reload --port 8000
```

### 2) Frontend (Terminal B)

```bash
cd /home/runner/work/document-qa-agent/document-qa-agent/frontend
npm install
npm run dev
```

Frontend dev server is configured for port **3000** (`frontend/vite.config.js`).

## Frontend API base URL configuration

The frontend currently uses a **hardcoded backend URL**, not an environment variable:

- `frontend/src/pages/HomePage.jsx` → `https://document-qa-agent-dq1u.onrender.com/upload`
- `frontend/src/pages/ChatPage.jsx` → `https://document-qa-agent-dq1u.onrender.com/ask`

So for local backend usage (`http://localhost:8000`), you must currently edit those files (or add your own env-based wiring in code).

## API endpoints

Base URL (local): `http://localhost:8000`

### `GET /`
Health check.

**Example**

```bash
curl http://localhost:8000/
```

**Response shape**

```json
{ "status": "DocuMind backend is running" }
```

### `POST /upload`
Upload one document (multipart form field name: `file`).

**Example**

```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file=@/absolute/path/to/document.pdf"
```

**Success response shape**

```json
{
  "message": "document.pdf processed successfully",
  "chunks": 42
}
```

**Error response shape (unsupported extension)**

```json
{ "error": "Unsupported file type" }
```

### `POST /ask`
Ask a question about the currently indexed document.

**Example**

```bash
curl -X POST "http://localhost:8000/ask" \
  -H "Content-Type: application/json" \
  -d '{"question":"Summarize the key points"}'
```

**Success response shape**

```json
{ "answer": "...model output..." }
```

**Error response shape (no upload yet)**

```json
{ "error": "No document uploaded yet" }
```

### Current backend state limitations (important)

From current implementation (`backend/main.py`, `backend/rag_pipeline.py`):

- The in-memory `vector_store` is a global process variable.
- New uploads overwrite the previous active document index.
- State is not isolated per user/session.
- If the process restarts, in-memory state is lost (even though FAISS index is saved to `faiss_index`, startup does not automatically load it).

## Deployment notes

### Frontend (Vercel)

`frontend/vercel.json` defines:

- `installCommand`: `npm install --include=dev`
- `buildCommand`: `npm install && npm run build`

Deploy `frontend/` as the Vercel project root.

### Backend (Python web service)

The backend includes a Procfile command:

```procfile
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

Deploy `backend/` to a Python host (e.g., any platform that runs Uvicorn/FastAPI with env vars). Ensure `GROQ_API_KEY` and `GEMINI_API_KEY` are set in deployment environment settings.

## Security & production considerations

- Never commit API keys or `.env` files.
- Restrict CORS (current code allows `"*"`; lock this down in production).
- Validate uploads more strictly (size/type/content checks, malware scanning policy as needed).
- Add multi-user/session isolation so one user cannot overwrite another user’s vector store.
- Use persistent, managed vector storage and robust lifecycle management for production workloads.

## License

No license is currently specified in this repository.
