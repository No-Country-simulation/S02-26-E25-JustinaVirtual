export function createInstrument() {
  return {
    x: 0,
    y: 0,
    radius: 6,
    path: [],

    update(mouseX, mouseY, isInsideTarget) {
      this.x = mouseX;
      this.y = mouseY;

      this.path.push({
        x: mouseX,
        y: mouseY,
        inside: isInsideTarget
      });

      if (this.path.length > 2000) {
        this.path.shift();
      }
    },

    drawPath(ctx) {
      if (this.path.length < 2) return;

      for (let i = 1; i < this.path.length; i++) {
        const prev = this.path[i - 1];
        const curr = this.path[i];

        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);

        ctx.strokeStyle = curr.inside
          ? "rgba(0, 180, 0, 0.6)" // Verde (correto)
          : "rgba(220, 0, 0, 0.6)"; // Vermelho (erro)

        ctx.lineWidth = 2;
        ctx.stroke();
      }
    },

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();
    }
  };
}