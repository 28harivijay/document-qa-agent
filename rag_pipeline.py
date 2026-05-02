from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings 
from langchain_community.vectorstores import FAISS
from groq import Groq
import os
from dotenv import load_dotenv
load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def load_pdf(file_path):
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    return documents

def get_chunks(documents):
    chunks = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50).create_documents(
        [doc.page_content for doc in documents],
        metadatas=[doc.metadata for doc in documents]
    )
    return chunks

# Takes the documents list as input
# Uses RecursiveCharacterTextSplitter with chunk_size=500 and chunk_overlap=50
# Returns the chunks

def get_embeddings():
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Creates and returns a HuggingFaceEmbeddings object with model name "all-MiniLM-L6-v2"

def create_vector_store(chunks,embeddings):
    vector_store = FAISS.from_documents(chunks, embeddings)
    vector_store.save_local("faiss_index")
    return vector_store

# Function 1 — create_vector_store:

# Takes chunks and embeddings as input
# Creates a FAISS index from your chunks using FAISS.from_documents()
# Saves it locally to a folder called faiss_index
# Returns the vector store


def load_vector_store(embeddings):
    return FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)

# Function 2 — load_vector_store:

# Takes embeddings as input
# Loads the saved index from faiss_index folder
# Returns the vector store

def retrieve_relevant_chunks(question, vector_store):
    retriever = vector_store.as_retriever(search_kwargs={"k": 3})
    relevant_chunks = retriever.invoke(question)
    return relevant_chunks

# In rag_pipeline.py write a function that:

# Takes a question and vector store as input
# Creates a retriever with k=3 (return top 3 chunks)
# Uses .invoke() to search with the question
# Returns the relevant chunks

# Then in main.py:

# Call it with the question "what is the capital recovery factor?"
# Loop through the returned chunks and print each one's page_content

def answer_question(question, relevant_chunks):
    context = "\n".join([chunk.page_content for chunk in relevant_chunks])
    prompt = f"Context: {context}\n\nQuestion: {question}\nAnswer:"

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

# In rag_pipeline.py write a function that:

# Takes a question and relevant chunks as input
# Joins the chunks into one context string
# Builds the prompt with context + question
# Calls Groq using groq library with model "llama3-8b-8192"
# Returns the answer text

# Then in main.py call it and print the answer.
