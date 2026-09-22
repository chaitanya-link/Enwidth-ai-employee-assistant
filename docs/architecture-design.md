# System Architecture — Enwidth AI Employee Assistant

## 1. High-Level Overview

This system has three main layers:

1. **Frontend (React)** — chat interface where the employee types questions.
2. **Backend (FastAPI)** — the brain: runs the RAG pipeline, the Agent, and the Tools.
3. **External Services** — LLM providers (Gemini, OpenAI) and the Vector Database (ChromaDB).

```
┌─────────────────────┐
│   React Frontend     │
│  (Chat UI, EMP ID    │
│   selector)           │
└──────────┬───────────┘
           │ HTTP POST /chat
           ▼
┌─────────────────────────────────────────────┐
│              FastAPI Backend                  │
│                                               │
│  ┌───────────────┐    ┌────────────────────┐ │
│  │  Agent Layer   │───▶│   Tool Router       │ │
│  │ (decides which │    │                     │ │
│  │  tool to call) │    │ 1. search_company_  │ │
│  └───────┬────────┘    │    documents()      │ │
│          │             │ 2. get_employee_    │ │
│          │             │    info()           │ │
│          │             │ 3. apply_leave()    │ │
│          │             └──────────┬──────────┘ │
│          │                        │            │
│          ▼                        ▼            │
│  ┌───────────────┐    ┌────────────────────┐ │
│  │  Conversation  │    │   Mock Employee DB  │ │
│  │  Memory Store  │    │   (Python dict)     │ │
│  └────────────────┘    └────────────────────┘ │
│          │                                     │
│          ▼                                     │
│  ┌────────────────────────────────────────┐   │
│  │           RAG Pipeline                   │   │
│  │  Retriever → ChromaDB → Top-K Chunks    │   │
│  └──────────────────┬───────────────────────┘   │
│                     │                            │
│                     ▼                            │
│  ┌────────────────────────────────────────┐   │
│  │        LLM Router (fallback chain)       │   │
│  │  Gemini Model 1 → Gemini Model 2 →       │   │
│  │  OpenAI (fallback)                        │   │
│  └────────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
           │
           ▼
   ┌───────────────┐
   │   ChromaDB     │  (persisted on disk, holds
   │ Vector Store   │   embedded document chunks)
   └───────────────┘
```

## 2. Document Ingestion Pipeline (offline / startup step)

```
Company Documents (.txt files in backend/documents/)
        │
        ▼
   Document Loader (LangChain TextLoader)
        │
        ▼
   Chunking (RecursiveCharacterTextSplitter,
             chunk_size=500, overlap=50)
        │
        ▼
   Embedding Generation (Gemini Embedding model)
        │
        ▼
   Stored in ChromaDB with metadata
   (source filename, chunk index)
```

This pipeline runs once when the backend starts (or when documents change) — it does not run on every user question.

## 3. Query-Time Flow (runs on every /chat request)

```
User sends message
        │
        ▼
Conversation history retrieved (per employee_id)
        │
        ▼
Agent receives: message + history + available tools
        │
        ▼
Agent decides (LLM reasoning) which tool(s) to call:
   - search_company_documents → RAG retrieval
   - get_employee_info        → dict lookup
   - apply_leave              → mock write operation
        │
        ▼
Tool(s) execute, results collected
        │
        ▼
LLM generates final natural-language answer
using tool results as context
        │
        ▼
Response returned: { answer, sources, tools_used }
        │
        ▼
Conversation history updated
```

## 4. Components Summary

| Component | Technology | Responsibility |
|---|---|---|
| Frontend | React | Chat UI, displays answer/sources/tools |
| Backend framework | FastAPI | API endpoints, orchestration |
| Agent framework | LangChain | Tool-calling agent logic |
| Vector database | ChromaDB | Stores & retrieves document embeddings |
| Embeddings | Gemini Embedding API | Converts text → vectors |
| LLM | Gemini (primary) → OpenAI (fallback) | Reasoning + answer generation |
| Memory | LangChain ConversationBufferMemory (per employee_id) | Keeps track of chat history |
| Deployment | Vercel (frontend) + Render/Docker (backend) | Hosting |

## 5. Fallback Logic (LLM Router)

```
Try Gemini Model A
   │
   ├── Success → return response
   │
   └── Fails / rate-limited
          │
          ▼
   Try Gemini Model B
          │
          ├── Success → return response
          │
          └── Fails / rate-limited
                 │
                 ▼
          Try OpenAI Model
                 │
                 ├── Success → return response
                 │
                 └── Fails → return graceful error message
```

## 6. Frontend ↔ Backend Communication

- Frontend sends `POST /chat` with JSON body: `{ employee_id, message }`
- Backend responds with JSON: `{ answer, sources, tools_used }`
- Communication is stateless per request — backend maintains history server-side, keyed by `employee_id`
