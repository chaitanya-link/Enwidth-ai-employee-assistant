const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Sends a message to the backend /chat endpoint and returns the parsed response.
 * Throws an error if the backend is unreachable or returns a non-OK status,
 * so the UI can show a graceful "assistant unavailable" message instead of crashing.
 */
export async function sendMessage(employeeId, message) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employee_id: employeeId, message }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "The assistant is currently unavailable.");
  }

  return response.json(); // { answer, sources, tools_used }
}