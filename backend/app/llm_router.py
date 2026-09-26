import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

# List of Gemini API keys to try in order. If one hits its quota limit,
# the next one is automatically tried. This gives us resilience against
# the free tier's 20-requests-per-day-per-key limit, without needing a
# paid OpenAI fallback.
GEMINI_KEYS = [
    os.getenv("GEMINI_API_KEY_1"),
    os.getenv("GEMINI_API_KEY_2"),
    os.getenv("GEMINI_API_KEY_3"),
]
GEMINI_KEYS = [k for k in GEMINI_KEYS if k]  # remove any empty/missing keys

MODEL_NAME = "gemini-3.5-flash"


def get_working_llm():
    """
    Tries each available Gemini API key in order.
    Returns the first one that successfully responds to a tiny test call.
    Raises an error only if ALL keys are exhausted.
    """
    last_error = None

    for i, key in enumerate(GEMINI_KEYS, start=1):
        try:
            llm = ChatGoogleGenerativeAI(
                model=MODEL_NAME,
                google_api_key=key,
                temperature=0.2
            )
            # Quick test call to confirm this key actually works right now
            llm.invoke("ping")
            print(f"[llm_router] Using Gemini API key #{i}")
            return llm
        except Exception as e:
            print(f"[llm_router] Gemini key #{i} failed ({type(e).__name__}), trying next key...")
            last_error = e
            continue

    raise RuntimeError(
        f"All {len(GEMINI_KEYS)} Gemini API keys are exhausted or invalid. "
        f"Last error: {last_error}"
    )


if __name__ == "__main__":
    llm = get_working_llm()
    response = llm.invoke("Say hello in one short sentence.")
    print("Response:", response.content)