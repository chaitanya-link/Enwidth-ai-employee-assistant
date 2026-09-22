# Schema Design — Enwidth AI Employee Assistant

This document defines every data structure used in the system: what's stored, in what shape, and where.

---

## 1. Vector Database Schema (ChromaDB)

Each chunk of a document is stored as one entry with the following shape:

| Field | Type | Example | Purpose |
|---|---|---|---|
| `id` | string | `"wfh_policy_chunk_2"` | Unique ID for the chunk |
| `embedding` | float[] | `[0.021, -0.114, ...]` | Vector representation of the chunk text |
| `document` (the text itself) | string | `"Employees can work from home up to 2 days a week..."` | The actual chunk content |
| `metadata.source` | string | `"wfh_policy.txt"` | Which file this chunk came from (used for "Sources" in the answer) |
| `metadata.chunk_index` | int | `2` | Position of this chunk within its source document |

**Chunking strategy:**
- Splitter: `RecursiveCharacterTextSplitter` (LangChain)
- `chunk_size`: 500 characters
- `chunk_overlap`: 50 characters
- Reasoning: policy documents are short and paragraph-based, so medium-sized overlapping chunks preserve context without splitting a rule across chunks.

---

## 2. Mock Employee Database Schema

Stored as a Python dictionary (in-memory, or optionally a small JSON file) — key = `employee_id`.

```json
{
  "EMP001": {
    "name": "Rahul",
    "department": "Engineering",
    "leave_balance": 12
  },
  "EMP002": {
    "name": "Priya",
    "department": "HR",
    "leave_balance": 8
  }
}
```

| Field | Type | Notes |
|---|---|---|
| `employee_id` (key) | string | Format: `EMP` + 3-digit number |
| `name` | string | Employee's display name |
| `department` | string | Department name |
| `leave_balance` | int | Remaining leave days |

---

## 3. Leave Application Record Schema

Created/updated whenever `apply_leave()` is called (mock — held in memory or a simple list for the session).

```json
{
  "employee_id": "EMP001",
  "start_date": "2026-09-20",
  "end_date": "2026-09-22",
  "reason": "Travelling",
  "status": "success",
  "message": "Leave application submitted successfully."
}
```

| Field | Type | Notes |
|---|---|---|
| `employee_id` | string | Who applied |
| `start_date` | date (ISO format) | Leave start |
| `end_date` | date (ISO format) | Leave end |
| `reason` | string | Free text |
| `status` | string | `"success"` or `"failure"` |
| `message` | string | Human-readable result |

---

## 4. API Schema — `POST /chat`

**Request:**
```json
{
  "employee_id": "EMP001",
  "message": "How many leaves do I have?"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `employee_id` | string | Yes | Identifies the employee for tool lookups and conversation memory |
| `message` | string | Yes | The user's question or request |

**Response:**
```json
{
  "answer": "You have 12 days remaining.",
  "sources": [],
  "tools_used": ["get_employee_info"]
}
```

| Field | Type | Notes |
|---|---|---|
| `answer` | string | Final natural-language response |
| `sources` | string[] | List of document filenames used (empty if no RAG was used) |
| `tools_used` | string[] | Names of tools the agent called for this request |

**Error response (example):**
```json
{
  "error": "LLM service unavailable",
  "detail": "All configured models failed to respond."
}
```

---

## 5. Conversation Memory Schema

Kept server-side, in-memory, keyed by `employee_id`:

```json
{
  "EMP001": [
    { "role": "user", "content": "How many leaves do I have?" },
    { "role": "assistant", "content": "You have 12 days remaining." },
    { "role": "user", "content": "Can I take 3 days next month?" }
  ]
}
```

| Field | Type | Notes |
|---|---|---|
| `employee_id` (key) | string | Session identifier (kept simple — no login system) |
| `role` | string | `"user"` or `"assistant"` |
| `content` | string | The message text |

**Note:** This is in-memory only (resets on server restart). This is a documented limitation, acceptable for an assessment/demo scope.

---

## 6. Environment Variables Schema (`.env`)

```
GEMINI_API_KEY_1=
GEMINI_API_KEY_2=
OPENAI_API_KEY=
CHROMA_DB_PATH=./chroma_data
RETRIEVAL_CONFIDENCE_THRESHOLD=0.4
```

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY_1` | Primary Gemini model key |
| `GEMINI_API_KEY_2` | Backup Gemini model key (or same key, different model) |
| `OPENAI_API_KEY` | Fallback LLM provider |
| `CHROMA_DB_PATH` | Where ChromaDB persists its data |
| `RETRIEVAL_CONFIDENCE_THRESHOLD` | Minimum similarity score to trust a retrieved chunk (bonus feature) |
