export default function MessageBubble({ role, content, toolsUsed }) {
  const isUser = role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "16px",
      }}
    >
      <div style={{ maxWidth: "72%" }}>
        <div
          style={{
            padding: "14px 18px",
            borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            background: isUser
              ? "linear-gradient(135deg, rgba(201,166,255,0.22), rgba(129,140,248,0.18))"
              : "rgba(255,255,255,0.05)",
            border: "1px solid var(--color-panel-border)",
            color: "var(--color-text)",
            fontSize: "15px",
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
          }}
        >
          {content}
        </div>

        {!isUser && toolsUsed && toolsUsed.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "6px",
              marginTop: "8px",
              flexWrap: "wrap",
            }}
          >
            {toolsUsed.map((tool, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10.5px",
                  padding: "3px 8px",
                  borderRadius: "5px",
                  background: "rgba(246,193,119,0.12)",
                  border: "1px solid rgba(246,193,119,0.3)",
                  color: "var(--color-gold)",
                }}
              >
                {tool}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
