import { useState } from "react";
import ParticleBackground from "./components/ParticleBackground";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

function App() {
  const [employeeId, setEmployeeId] = useState("EMP001");
  const [toolLog, setToolLog] = useState([]);

  function handleToolUsed(tool) {
    setToolLog((prev) => [...prev, tool]);
  }

  return (
    <div style={{ position: "relative", height: "100vh", display: "flex" }}>
      <ParticleBackground />

      <div style={{ position: "relative", zIndex: 1, display: "flex", width: "100%", height: "100%", minHeight: 0 }}>
        <Sidebar
          selectedEmployee={employeeId}
          onSelectEmployee={setEmployeeId}
          toolLog={toolLog}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <header
            style={{
              padding: "20px 28px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                color: "var(--color-text-muted)",
              }}
            >
              Enwidth · Employee Assistant
            </span>
          </header>

          <ChatWindow employeeId={employeeId} onToolUsed={handleToolUsed} />
        </div>
      </div>
    </div>
  );
}

export default App;