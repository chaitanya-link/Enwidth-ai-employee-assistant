import os
import time
from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_google_genai import ChatGoogleGenerativeAI
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
- Always answer in a clear, natural, helpful tone. Mention the source document when you used
  search_company_documents_tool.
"""


def extract_text(content):
    """
    Gemini sometimes returns content as a plain string, and sometimes as a
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


def get_agent():
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=os.getenv("GEMINI_API_KEY_1"),
        temperature=0.2
    )
    return create_agent(
        model=llm,
        tools=ALL_TOOLS,
        system_prompt=SYSTEM_PROMPT
    )


def run_agent(user_message, employee_id=None):
    """
    Runs the agent on a single user message.
    employee_id is injected into the message so the agent knows which
    employee the question is about (used by get_employee_info_tool / apply_leave_tool).
    """
    agent = get_agent()

    if employee_id:
        content = f"(employee_id: {employee_id}) {user_message}"
    else:
        content = user_message

    result = agent.invoke({
        "messages": [{"role": "user", "content": content}]
    })

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
    test_cases = [
        ("What is the leave policy?", None),                                    # Scenario 1: RAG only
        ("How many leaves do I have remaining?", "EMP001"),                     # Scenario 2: Tool only
        ("What is the leave policy and how many leaves do I have remaining?", "EMP002"),  # Scenario 3: Multi-tool
        ("Apply leave for EMP001 from 2026-09-20 to 2026-09-22 because I'm travelling.", "EMP001"),  # Scenario 4: Action
    ]

    for question, emp_id in test_cases:
        print("\n" + "=" * 60)
        print(f"Q ({emp_id}): {question}")
        result = run_agent(question, emp_id)
        print("Answer:", result["answer"])
        print("Tools used:", result["tools_used"])
        print("Waiting 20 seconds to respect free-tier rate limits...")
        time.sleep(20)