import { useRef, useEffect } from "react";

export default function CanvasStage({ onFrame }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Delegamos o desenho para fora
      onFrame(ctx);

      animationId = requestAnimationFrame(loop);
    }

    // 🚀 AQUI ESTAVA FALTANDO
    loop();

    return () => cancelAnimationFrame(animationId);
  }, [onFrame]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={500}
      className="border mx-auto block bg-white"
    />
  );
}
