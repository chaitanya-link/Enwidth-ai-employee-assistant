from langchain.tools import tool
from rag import search_company_documents, ask_question
from employee_db import get_employee_info as _get_employee_info
from employee_db import apply_leave as _apply_leave


@tool
def search_company_documents_tool(query: str) -> str:
    """
    Use this tool whenever the user asks about company policies,
    HR rules, or FAQs (e.g. leave policy, WFH policy, travel policy,
    benefits, or general company questions).
    """
    result = ask_question(query)
    sources = ", ".join(result["sources"]) if result["sources"] else "No source found"
    return f"Answer: {result['answer']}\nSources: {sources}"


@tool
def get_employee_info_tool(employee_id: str) -> str:
    """
    Use this tool to fetch an employee's details (name, department,
    leave balance) using their employee ID (e.g. EMP001).
    """
    result = _get_employee_info(employee_id)
    return str(result)


@tool
def apply_leave_tool(employee_id: str, start_date: str, end_date: str, reason: str) -> str:
    """
    Use this tool to submit a leave application for an employee.
    Requires employee_id, start_date (YYYY-MM-DD), end_date (YYYY-MM-DD),
    and a reason for the leave.
    """
    result = _apply_leave(employee_id, start_date, end_date, reason)
    return str(result)


# List of all tools, used by the Agent in Part 3
ALL_TOOLS = [
    search_company_documents_tool,
    get_employee_info_tool,
    apply_leave_tool
]

if __name__ == "__main__":
    print("--- Test search_company_documents_tool ---")
    print(search_company_documents_tool.invoke("What is the leave policy?"))

    print("\n--- Test get_employee_info_tool ---")
    print(get_employee_info_tool.invoke("EMP001"))

    print("\n--- Test apply_leave_tool ---")
    print(apply_leave_tool.invoke({
        "employee_id": "EMP002",
        "start_date": "2026-10-01",
        "end_date": "2026-10-03",
        "reason": "Family function"
    }))