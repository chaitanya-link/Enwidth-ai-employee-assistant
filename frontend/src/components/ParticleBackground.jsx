import { useEffect, useRef } from "react";

/**
 * A field of drifting nodes connected by faint lines when close together —
 * visually representing embedding space (the vector database concept
 * behind this app's RAG pipeline). Nodes near the cursor glow brighter,
 * as if activated, and the whole field gently shifts with cursor position
 * for a subtle parallax/depth illusion.
 */
export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const NODE_COLOR = "237, 234, 246";   // soft off-white lavender
    const GLOW_COLOR = "201, 166, 255";   // signature violet accent
    const LINE_COLOR = "201, 166, 255";   // violet, very faint

    const NODE_COUNT = Math.floor((width * height) / 24000);
    const CONNECT_DISTANCE = 130;
    const CURSOR_RADIUS = 200;

    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      depth: Math.random() * 0.6 + 0.4,
    }));

    function handleResize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function handleMouseMove(e) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    function handleMouseLeave() {
      mouseRef.current = { x: -9999, y: -9999 };
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const mouse = mouseRef.current;

      const parallaxX = (mouse.x - width / 2) * 0.012;
      const parallaxY = (mouse.y - height / 2) * 0.012;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        const drawX = n.x + parallaxX * n.depth;
        const drawY = n.y + parallaxY * n.depth;

        const distToMouse = Math.hypot(mouse.x - drawX, mouse.y - drawY);
        const isNear = distToMouse < CURSOR_RADIUS;
        const glow = isNear ? 1 - distToMouse / CURSOR_RADIUS : 0;

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = n.x - other.x;
          const dy = n.y - other.y;
          const dist = Math.hypot(dx, dy);
          if (dist < CONNECT_DISTANCE) {
            const opacity = (1 - dist / CONNECT_DISTANCE) * 0.12;
            ctx.strokeStyle = `rgba(${LINE_COLOR}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(drawX, drawY);
            ctx.lineTo(
              other.x + parallaxX * other.depth,
              other.y + parallaxY * other.depth
            );
            ctx.stroke();
          }
        }

        const baseRadius = 1.6 * n.depth;
        const radius = baseRadius + glow * 3;
        ctx.beginPath();
        ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
        ctx.fillStyle = isNear
          ? `rgba(${GLOW_COLOR}, ${0.5 + glow * 0.5})`
          : `rgba(${NODE_COLOR}, ${0.35 * n.depth})`;
        if (isNear) {
          ctx.shadowColor = `rgba(${GLOW_COLOR}, 0.8)`;
          ctx.shadowBlur = 12 * glow;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}