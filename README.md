# Document QA Agent (DocuMind)

AI-powered document question-answering app where users upload a file and chat with answers grounded in that document.

## Features

- Upload and analyze **PDF**, **DOCX**, and **XLSX** files
- Ask natural-language questions about uploaded content
- Retrieval-Augmented Generation (RAG) with FAISS vector search
- React frontend with FastAPI backend

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** FastAPI + LangChain + FAISS
- **LLM:** Groq (`llama-3.1-8b-instant`)
- **Embeddings:** Hugging Face endpoint embeddings (`all-MiniLM-L6-v2`)

## Project Structure

```text
document-qa-agent/
├── backend/      # FastAPI + RAG pipeline
├── frontend/     # React client
└── README.md
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- Groq API key
- Hugging Face API token

## Environment Variables

Create `backend/.env`:

```env
GROQ_API_KEY=your_groq_key
HF_TOKEN=your_huggingface_token
```

## Local Setup

### 1) Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend default URL: `http://127.0.0.1:8000`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://127.0.0.1:5173`

## API Endpoints

- `GET /` — health check
- `POST /upload` — upload and index a document
- `POST /ask` — ask a question about the uploaded document

## Deployment Note (Important)

The backend is deployed on **Render**. Since Render free/idle services can sleep, the **first request may take some extra time** while the backend wakes up and loads dependencies.  
After startup, responses should be much faster.

## Usage

1. Open the app.
2. Select file type and upload a document.
3. Wait for processing to complete.
4. Ask questions in the chat interface.
