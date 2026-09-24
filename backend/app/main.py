from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import run_agent

app = FastAPI(title="Enwidth AI Employee Assistant API")

# Allow the React frontend (running on a different port/domain) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for development; restrict this to your actual frontend URL before real deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    employee_id: str
    message: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[str] = []
    tools_used: list[str] = []


@app.get("/")
def root():
    """Simple health check endpoint."""
    return {"status": "AI Employee Assistant backend is running"}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """
    Main chat endpoint. Takes an employee_id and a message,
    runs the agent, and returns the answer + tools used.
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    try:
        result = run_agent(request.message, request.employee_id)
        return ChatResponse(
            answer=result["answer"],
            sources=[],  # sources are already mentioned inline in the answer text by the agent
            tools_used=result["tools_used"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"The assistant is temporarily unavailable. Please try again shortly. ({type(e).__name__})"
        )