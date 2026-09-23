import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from vectorstore import get_vectorstore

load_dotenv()

CONFIDENCE_THRESHOLD = float(os.getenv("RETRIEVAL_CONFIDENCE_THRESHOLD", 0.4))

NOT_FOUND_MESSAGE = "I couldn't find this information in the provided documents."

def get_llm():
    """Returns the Gemini chat model used to generate answers."""
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=os.getenv("GEMINI_API_KEY_1"),
        temperature=0.2
    )

def search_company_documents(query, k=3):
    """
    Searches the vector database for the most relevant chunks.
    Returns a list of (chunk, similarity_score) tuples.
    Chroma returns DISTANCE (lower = more similar), so we convert it
    into a similarity score (higher = more similar) for easier thresholding.
    """
    vectorstore = get_vectorstore()
    results_with_scores = vectorstore.similarity_search_with_score(query, k=k)

    processed = []
    for doc, distance in results_with_scores:
        similarity = 1 - distance  # convert distance to similarity
        processed.append((doc, similarity))
    return processed

def ask_question(query):
    """
    Full RAG flow:
    1. Retrieve relevant chunks
    2. Check confidence threshold (hallucination prevention)
    3. If confident enough, generate answer using LLM
    4. Return answer + sources
    """
    results = search_company_documents(query)

    if not results:
        return {"answer": NOT_FOUND_MESSAGE, "sources": []}

    # Check if best match is confident enough
    best_score = max(score for _, score in results)
    if best_score < CONFIDENCE_THRESHOLD:
        return {"answer": NOT_FOUND_MESSAGE, "sources": []}

    # Build context from retrieved chunks
    context_text = "\n\n".join([doc.page_content for doc, _ in results])
    sources = list(set(doc.metadata.get("source") for doc, _ in results))

    prompt = f"""You are an internal company assistant. Answer the employee's question
using ONLY the context below. If the context does not contain the answer,
say: "{NOT_FOUND_MESSAGE}"

Context:
{context_text}

Question: {query}

Answer clearly and concisely:"""

    llm = get_llm()
    response = llm.invoke(prompt)

    return {
        "answer": response.content,
        "sources": sources
    }

if __name__ == "__main__":
    test_questions = [
        "What is the work from home policy?",
        "Does the company provide pet insurance?",
        "How many annual leaves are allowed?"
    ]

    for q in test_questions:
        print("\n" + "="*50)
        print("Q:", q)
        result = ask_question(q)
        print("Answer:", result["answer"])
        print("Sources:", result["sources"])