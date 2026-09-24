import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import MessageBubble from "./MessageBubble";
import { sendMessage } from "../api";

export default function ChatWindow({ employeeId, onToolUsed }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your Employee AI Assistant. Ask me about company policies, your leave balance, or apply for leave.",
      toolsUsed: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // Subtle cursor-reactive tilt on the panel itself
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), {
    stiffness: 150,
    damping: 20,
  });

  function handleMouseMove(e) {
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

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

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "var(--color-panel)",
        backdropFilter: "blur(20px)",
        border: "1px solid var(--color-panel-border)",
        borderRadius: "20px",
        margin: "28px 28px 28px 0",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px",
        }}
      >
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            role={msg.role}
            content={msg.content}
            toolsUsed={msg.toolsUsed}
          />
        ))}
        {loading && (
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            Thinking...
          </p>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          padding: "18px 20px",
          borderTop: "1px solid var(--color-panel-border)",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about leave, WFH policy, benefits..."
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--color-panel-border)",
            borderRadius: "12px",
            padding: "12px 16px",
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            padding: "12px 22px",
            borderRadius: "12px",
            border: "none",
            background: "var(--color-accent)",
            color: "#1C1832",
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </div>
    </motion.div>
  );
}