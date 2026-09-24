const EMPLOYEES = [
  { id: "EMP001", name: "Rahul", department: "Engineering" },
  { id: "EMP002", name: "Priya", department: "HR" },
  { id: "EMP003", name: "Sneha", department: "Finance" },
];

export default function Sidebar({ selectedEmployee, onSelectEmployee, toolLog }) {
  return (
    <aside
      style={{
        width: "260px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "28px 20px",
      }}
    >
      <div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--color-text-muted)",
            margin: "0 0 10px",
            letterSpacing: "0.02em",
          }}
        >
          Signed in as
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {EMPLOYEES.map((emp) => {
            const isActive = emp.id === selectedEmployee;
            return (
              <button
                key={emp.id}
                onClick={() => onSelectEmployee(emp.id)}
                style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: isActive
                    ? "1px solid var(--color-accent)"
                    : "1px solid var(--color-panel-border)",
                  background: isActive ? "var(--color-accent-soft)" : "transparent",
                  color: "var(--color-text)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                  {emp.name}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {emp.id} · {emp.department}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--color-text-muted)",
            margin: "0 0 10px",
          }}
        >
          Tools used this session
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {toolLog.length === 0 && (
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
              None yet — ask something to get started.
            </p>
          )}
          {toolLog.map((tool, i) => (
            <span
              key={i}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                padding: "5px 10px",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--color-panel-border)",
                color: "var(--color-gold)",
                width: "fit-content",
              }}
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}