import os
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

DOCUMENTS_PATH = os.path.join(os.path.dirname(__file__), "..", "documents")

def load_documents():
    """Loads all .txt files from the documents folder and cleans up source paths."""
    documents = []
    for filename in os.listdir(DOCUMENTS_PATH):
        if filename.endswith(".txt"):
            filepath = os.path.join(DOCUMENTS_PATH, filename)
            loader = TextLoader(filepath, encoding="utf-8")
            loaded = loader.load()
            for doc in loaded:
                doc.metadata["source"] = filename  # clean filename only, not full path
            documents.extend(loaded)
    return documents

def chunk_documents(documents):
    """Splits documents into smaller overlapping chunks."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    return splitter.split_documents(documents)

if __name__ == "__main__":
    docs = load_documents()
    print(f"Loaded {len(docs)} documents.")

    chunks = chunk_documents(docs)
    print(f"Split into {len(chunks)} chunks.")

    print("\n--- Sample chunk ---")
    print("Content:", chunks[0].page_content)
    print("Source:", chunks[0].metadata)