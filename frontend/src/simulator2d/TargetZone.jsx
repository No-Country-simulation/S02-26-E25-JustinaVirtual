export function createTargetZone() {
  return {
    // 💡 PASSO 1: Peça para o Everton posicionar o rim na tela.
    // Depois, ajustem esses 4 números para cercar a área da lesão.
    x: 300, 
    y: 200,
    width: 250,
    height: 150,

    draw(ctx) {
      
      // Usado um gradiente ou uma cor suave para não "sujar" .
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([6, 4]); // Linha tracejada profissional
      ctx.strokeStyle = "rgba(0, 255, 127, 0.4)"; // Verde água suave
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      
      // Um leve preenchimento para o Everton saber onde é a área "segura"
      ctx.fillStyle = "rgba(0, 255, 127, 0.05)"; 
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.restore();
    },

    contains(x, y) {
      return (
        x >= this.x &&
        x <= this.x + this.width &&
        y >= this.y &&
        y <= this.y + this.height
      );
    }
  };
}