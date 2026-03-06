export function createTargetZone() {
  return {
    x: 300,
    y: 200,
    width: 200,
    height: 100,

    draw(ctx) {
      ctx.strokeStyle = "green";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
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