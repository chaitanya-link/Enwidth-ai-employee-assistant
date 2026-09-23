import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from document_loader import load_documents, chunk_documents

load_dotenv()

CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_data")
COLLECTION_NAME = "company_documents"

def get_embedding_model():
    """Returns the Gemini embedding model."""
    return GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=os.getenv("GEMINI_API_KEY_1")
    )

def build_vectorstore():
    """Loads documents, chunks them, embeds them, and stores in ChromaDB."""
    print("Loading documents...")
    docs = load_documents()

    print("Chunking documents...")
    chunks = chunk_documents(docs)
    print(f"Created {len(chunks)} chunks.")

    print("Generating embeddings and storing in ChromaDB...")
    embedding_model = get_embedding_model()

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embedding_model,
        collection_name=COLLECTION_NAME,
        persist_directory=CHROMA_DB_PATH
    )

    print(f"Vectorstore built and saved at: {CHROMA_DB_PATH}")
    return vectorstore

def get_vectorstore():
    """Loads an existing vectorstore from disk (without rebuilding)."""
    embedding_model = get_embedding_model()
    return Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embedding_model,
        persist_directory=CHROMA_DB_PATH
    )

if __name__ == "__main__":
    vectorstore = build_vectorstore()

    # Quick test: search for something related to work from home
    print("\n--- Test similarity search ---")
    results = vectorstore.similarity_search("work from home", k=2)
    for i, result in enumerate(results):
        print(f"\nResult {i+1}:")
        print("Source:", result.metadata.get("source"))
        print("Content snippet:", result.page_content[:150], "...")