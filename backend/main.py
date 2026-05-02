# Backend API for DocuMind - AI-powered document Q&A system

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import rag_pipeline
import shutil
import os

app = FastAPI()

# Enable CORS to allow requests from frontend (React app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize embeddings model on startup (used to convert text to vectors)
embeddings = rag_pipeline.get_embeddings()
# Stores the vector database after a document is uploaded
vector_store = None

# Health check endpoint - verify backend is running
@app.get("/")
def health_check():
    return {"status": "DocuMind backend is running"}

# File upload endpoint - accepts PDF, DOCX, or XLSX files
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Process uploaded document:
    1. Save file temporarily
    2. Load document based on file type
    3. Split into chunks for better search
    4. Create vector embeddings and save to FAISS index
    5. Return number of chunks created
    """
    global vector_store

    # Save uploaded file temporarily
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Load document based on file extension
    if file.filename.endswith(".pdf"):
        documents = rag_pipeline.load_pdf(temp_path)
    elif file.filename.endswith(".docx"):
        documents = rag_pipeline.load_word(temp_path)
    elif file.filename.endswith(".xlsx"):
        documents = rag_pipeline.load_excel(temp_path)
    else:
        os.remove(temp_path)
        return {"error": "Unsupported file type"}

    # Split document into smaller chunks and create searchable index
    chunks = rag_pipeline.get_chunks(documents)
    vector_store = rag_pipeline.create_vector_store(chunks, embeddings)
    
    # Clean up temporary file
    os.remove(temp_path)

    return {"message": f"{file.filename} processed successfully", "chunks": len(chunks)}

# Request model for asking questions
class QuestionRequest(BaseModel):
    question: str

# Question answering endpoint - retrieves relevant document chunks and generates answer
@app.post("/ask")
def ask_question(request: QuestionRequest):
    """
    Answer user questions based on uploaded document:
    1. Search vector store for 3 most relevant chunks
    2. Pass chunks as context to AI model
    3. Return AI-generated answer
    """
    # Check if a document has been uploaded
    if vector_store is None:
        return {"error": "No document uploaded yet"}

    # Find most relevant document sections
    relevant_chunks = rag_pipeline.retrieve_relevant_chunks(request.question, vector_store)
    # Generate answer using AI with relevant context
    answer = rag_pipeline.answer_question(request.question, relevant_chunks)

    return {"answer": answer}