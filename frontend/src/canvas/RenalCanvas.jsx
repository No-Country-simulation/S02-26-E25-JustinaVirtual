import { useEffect, useRef, useState } from "react";

export default function RenalCanvas() {
  const canvasRef = useRef(null);
  const [path, setPath] = useState([]);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 900;
    canvas.height = 500;

    const drawScene = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Rim (alvo)
      ctx.fillStyle = "#7c3aed";
      ctx.beginPath();
      ctx.ellipse(650, 250, 80, 120, 0, 0, Math.PI * 2);
      ctx.fill();

      // Vaso
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(200, 100);
      ctx.lineTo(600, 250);
      ctx.stroke();

      // Trajetória do instrumento
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      path.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    };

    drawScene();
  }, [path]);

  const handleMove = (e) => {
    if (!startTime) setStartTime(Date.now());

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPath((prev) => [...prev, { x, y, t: Date.now() }]);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMove}
      style={{
        border: "1px solid #27272a",
        background: "#09090b",
        cursor: "crosshair",
      }}
    />
  );
}