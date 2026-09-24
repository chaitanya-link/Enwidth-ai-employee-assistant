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

      <div style={{ position: "relative", zIndex: 1, display: "flex", width: "100%" }}>
        <Sidebar
          selectedEmployee={employeeId}
          onSelectEmployee={setEmployeeId}
          toolLog={toolLog}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <header style={{ padding: "28px 28px 0" }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                fontWeight: 600,
                margin: 0,
              }}
            >
              Enwidth <span style={{ color: "var(--color-text-muted)" }}>· Employee Assistant</span>
            </h1>
          </header>

          <ChatWindow employeeId={employeeId} onToolUsed={handleToolUsed} />
        </div>
      </div>
    </div>
  );
}

export default App;