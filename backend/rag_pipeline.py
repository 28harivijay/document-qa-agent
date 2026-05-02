# RAG Pipeline - Handles document loading, chunking, embeddings, and AI responses

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings 
from langchain_community.vectorstores import FAISS
from groq import Groq
import os
from dotenv import load_dotenv
from langchain_core.documents import Document as LangchainDoc

# Load API keys from .env file
load_dotenv()

# Initialize Groq AI client (using Llama model for generating answers)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# ==================== Document Loaders ====================

def load_pdf(file_path):
    """Extract text from PDF file"""
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    return documents

def load_word(file_path):
    """Extract text from Word (.docx) file"""
    from docx import Document
    doc = Document(file_path)
    # Combine all paragraphs into one text string
    text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
    return [LangchainDoc(page_content=text, metadata={"source": file_path})]

def load_excel(file_path):
    """Extract text from Excel (.xlsx) file"""
    import pandas as pd
    df = pd.read_excel(file_path)
    # Convert entire spreadsheet to readable text format
    text = df.to_string(index=False)
    return [LangchainDoc(page_content=text, metadata={"source": file_path})]


# ==================== Text Processing ====================

def get_chunks(documents):
    """
    Split documents into smaller chunks for better search results
    - chunk_size=500: each chunk contains ~500 characters
    - chunk_overlap=50: chunks overlap by 50 chars to preserve context
    """
    chunks = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50).create_documents(
        [doc.page_content for doc in documents],
        metadatas=[doc.metadata for doc in documents]
    )
    return chunks

def get_embeddings():
    """Initialize embedding model to convert text into vectors for semantic search"""
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


# ==================== Vector Store Management ====================

def create_vector_store(chunks, embeddings):
    """
    Create FAISS vector index from document chunks
    - Converts chunks to embeddings (vector representation)
    - Saves index locally for fast search
    """
    vector_store = FAISS.from_documents(chunks, embeddings)
    vector_store.save_local("faiss_index")
    return vector_store

def load_vector_store(embeddings):
    """Load previously saved FAISS vector index from disk"""
    return FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)


# ==================== Search & Retrieval ====================

def retrieve_relevant_chunks(question, vector_store):
    """
    Search document index and return top 3 most relevant chunks
    Uses semantic similarity to find chunks matching the question
    """
    retriever = vector_store.as_retriever(search_kwargs={"k": 3})
    relevant_chunks = retriever.invoke(question)
    return relevant_chunks


# ==================== AI Response Generation ====================

def answer_question(question, relevant_chunks):
    """
    Generate AI answer using Groq's Llama model
    1. Combine relevant chunks as context
    2. Send to AI with user question
    3. Return generated answer
    """
    # Combine all relevant chunks into one context string
    context = "\n".join([chunk.page_content for chunk in relevant_chunks])
    
    # Build prompt: provide context + ask question
    prompt = f"Context: {context}\n\nQuestion: {question}\nAnswer:"

    # Call Groq API with prompt
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )
    
    # Extract and return the answer text
    return response.choices[0].message.content
