import { useState } from "react";
import { Plus, Mic, ArrowUp } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { sendMessage } from "../api";
import { EMPLOYEES, getGreeting } from "../constants";

export default function ChatWindow({ employeeId, onToolUsed }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const employee = EMPLOYEES.find((e) => e.id === employeeId);
  const hasStartedChat = messages.length > 0;

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed, toolsUsed: [] }]);
    setInput("");
    setLoading(true);

    try {
      const result = await sendMessage(employeeId, trimmed);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.answer, toolsUsed: result.tools_used || [] },
      ]);
      (result.tools_used || []).forEach((tool) => onToolUsed(tool));
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I couldn't process that right now. (${err.message})`,
          toolsUsed: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const inputBar = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 12px 10px 20px",
        borderRadius: "999px",
        background: "var(--color-panel)",
        border: "1px solid var(--color-panel-border)",
        boxShadow: "0 8px 30px rgba(30,30,32,0.08)",
      }}
    >
      <Plus size={18} color="var(--color-text-muted)" />
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about leave, WFH policy, benefits..."
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          color: "var(--color-text)",
          fontFamily: "var(--font-body)",
          fontSize: "15px",
          outline: "none",
        }}
      />
      <Mic size={18} color="var(--color-text-muted)" />
      <button
        onClick={handleSend}
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          border: "none",
          background: "var(--color-accent)",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.5 : 1,
        }}
      >
        <ArrowUp size={18} color="#fff" />
      </button>
    </div>
  );

  if (!hasStartedChat) {
    // Hero / empty state — big centered greeting, like the Gemini reference
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 28px",
          minHeight: 0,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "38px",
            color: "var(--color-text)",
            marginBottom: "36px",
            textAlign: "center",
          }}
        >
          {getGreeting()}, {employee?.name}
        </h1>
        <div style={{ width: "100%", maxWidth: "680px" }}>{inputBar}</div>
      </div>
    );
  }

  // Active chat view
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        maxWidth: "760px",
        width: "100%",
        margin: "0 auto",
        padding: "0 28px 28px",
        minHeight: 0,
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 0", minHeight: 0 }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} toolsUsed={msg.toolsUsed} />
        ))}
        {loading && (
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>Thinking...</p>
        )}
      </div>

      {inputBar}
    </div>
  );
}