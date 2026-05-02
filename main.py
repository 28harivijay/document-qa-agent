import rag_pipeline

documents = rag_pipeline.load_pdf("documents/formula sheet.pdf")

chunks = rag_pipeline.get_chunks(documents)

vector_store = rag_pipeline.create_vector_store(chunks, rag_pipeline.get_embeddings())

vector_store = rag_pipeline.load_vector_store(rag_pipeline.get_embeddings())

question = "what is the capital recovery factor?"
relevant_chunks = rag_pipeline.retrieve_relevant_chunks(question, vector_store)

answer = rag_pipeline.answer_question(question, relevant_chunks)
print("Answer:", answer)