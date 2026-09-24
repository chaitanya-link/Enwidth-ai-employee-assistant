import os
import time
from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from tools import ALL_TOOLS

load_dotenv()

SYSTEM_PROMPT = """You are an internal Employee AI Assistant for the company.

You have access to these tools:
- search_company_documents_tool: for company policy, HR rules, or FAQ questions
- get_employee_info_tool: to fetch employee details and leave balance by employee ID
- apply_leave_tool: to submit a leave application

Rules:
- If the question is about policies (leave, WFH, travel, benefits, FAQs), use search_company_documents_tool.
- If the question is about a specific employee's info or leave balance, use get_employee_info_tool.
- If the question asks to apply/submit leave, first use get_employee_info_tool to confirm the
  employee exists and has leave balance, then use apply_leave_tool.
- If a question needs both policy info AND employee info, use both tools and combine the
  results into one clear final answer.
- Use the conversation history to understand follow-up questions. If the user previously asked
  about leave and now asks a related follow-up (e.g. "can I take 3 days next month?"), understand
  they are still talking about leave, even if they don't repeat the word "leave".
- Always answer in a clear, natural, helpful tone. Mention the source document when you used
  search_company_documents_tool.
"""

# Checkpointer stores conversation history in memory (per thread_id).
# NOTE: this resets when the server restarts — documented as a known limitation.
_checkpointer = MemorySaver()

# Build the agent ONCE at import time, so all requests share the same
# checkpointer and memory persists across calls within the app's lifetime.
#
# TEMPORARY: using OpenAI here because Gemini's free-tier daily quota (20
# requests/day) was exhausted during testing. We will switch back to Gemini
# as the primary model in Part 5, where we build proper Gemini -> Gemini ->
# OpenAI fallback logic. This is a live demonstration of exactly the problem
# that fallback logic is designed to solve.
_llm = ChatOpenAI(
    model="gpt-4o-mini",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.2
)

_agent = create_agent(
    model=_llm,
    tools=ALL_TOOLS,
    system_prompt=SYSTEM_PROMPT,
    checkpointer=_checkpointer
)


def extract_text(content):
    """
    Some models return content as a plain string, and sometimes as a
    list of content blocks (e.g. [{'type': 'text', 'text': '...'}]).
    This function safely extracts just the readable text either way.
    """
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        text_parts = []
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                text_parts.append(block.get("text", ""))
        return " ".join(text_parts).strip()
    return str(content)


def run_agent(user_message, employee_id=None):
    """
    Runs the agent on a single user message, remembering previous messages
    from the SAME employee_id (used as the conversation thread_id).
    """
    if employee_id:
        content = f"(employee_id: {employee_id}) {user_message}"
        thread_id = employee_id
    else:
        content = user_message
        thread_id = "anonymous"

    config = {"configurable": {"thread_id": thread_id}}

    result = _agent.invoke(
        {"messages": [{"role": "user", "content": content}]},
        config=config
    )

    final_message = result["messages"][-1]

    tools_used = [
        msg.name for msg in result["messages"]
        if hasattr(msg, "type") and msg.type == "tool"
    ]

    return {
        "answer": extract_text(final_message.content),
        "tools_used": list(set(tools_used))
    }


if __name__ == "__main__":
    # Simulates a real back-and-forth conversation with the SAME employee_id,
    # to prove the agent remembers context between messages.
    conversation = [
        "How many leaves do I have?",
        "Can I take 3 days next month?",
    ]

    employee_id = "EMP001"

    for message in conversation:
        print("\n" + "=" * 60)
        print(f"User ({employee_id}): {message}")
        result = run_agent(message, employee_id)
        print("Assistant:", result["answer"])
        print("Tools used:", result["tools_used"])