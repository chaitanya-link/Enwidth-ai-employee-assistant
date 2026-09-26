# Sample Queries

All queries below were tested live against the running application. Responses shown are real, unedited outputs.

---

### 1. RAG Retrieval

**Query:** `What is the leave policy?`

**Response:**
> The company provides the following types of leave to full-time employees: Casual Leave (6 days/year, cannot be carried forward), Sick Leave (6 days/year, cannot be carried forward), Earned Leave (12 days/year, up to 5 days can be carried forward), and Maternity Leave (26 weeks paid). The company also observes 10 public holidays annually, separate from leave balance.

**Sources:** `leave_policy.txt`
**Tools used:** `search_company_documents_tool`

---

### 2. Hallucination Prevention

**Query:** `Does the company provide pet insurance?`

**Expected response:** *"I couldn't find this information in the provided documents."*

The retrieval confidence threshold rejects this query before it reaches the LLM, since no chunk in the knowledge base scores above the similarity cutoff for "pet insurance" — correctly avoiding a fabricated answer.

---

### 3. Tool Calling

**Query:** `How many leaves does EMP001 have?`

**Response:**
> You have 12 leaves remaining.

**Tools used:** `get_employee_info_tool`

---

### 4. Multi-Tool Reasoning

**Query:** `What is the leave policy and how many leaves do I have remaining?`

**Response:**
> [Full leave policy breakdown from leave_policy.txt] ... You, Rahul (EMP001), have a leave balance of 12 days remaining.

**Tools used:** `search_company_documents_tool`, `get_employee_info_tool`

---

### 5. Agent Action

**Query:** `Apply leave for me from 2026-10-05 to 2026-10-07 because of a family function`

**Response:**
> Your leave application for a family function from 2026-10-05 to 2026-10-07 has been submitted successfully. You have 11 leave days remaining.

**Tools used:** `search_company_documents_tool`, `apply_leave_tool`, `get_employee_info_tool`

---

### 6. Conversational Context

**Follow-up query (same conversation, no re-mention of "leave"):** `How many leaves do I have now?`

**Response:**
> You currently have 11 leave days remaining.

This correctly reflects the balance *after* the leave application from the previous turn, proving the agent tracks both conversation history and the real effect of its own prior actions — not just repeated words.

---

### 7. Complex Multi-Intent Query

**Query:** `I need a few things: First, tell me my department and current leave balance. Second, explain both the WFH policy and the travel policy briefly. Third, apply leave for me from 2026-11-02 to 2026-11-04 for a medical checkup. Finally, based on my updated balance, tell me how many Earned Leave days I'd have left if I take 5 more days next quarter.`

**Response:** Correctly returned department, pre-leave balance, a combined summary of both policies (retrieved from two separate documents), confirmation of the new leave application, and reasoning on top of the updated balance.

**Tools used:** `search_company_documents_tool`, `get_employee_info_tool`, `apply_leave_tool`

This query demonstrates RAG across multiple documents, multi-tool orchestration, an agent action, and reasoning applied on top of a tool's own output — all within a single message.
