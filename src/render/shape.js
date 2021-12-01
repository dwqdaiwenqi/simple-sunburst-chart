import Group from './group.js'

const Shape = () => {
  const that = Group()
  Object.assign(that,{
    shape: true,
    z:0,
    visible:true,
    onClick(fuc) {
      this.clickHandle = fuc;
    },
    onMouseover(fuc) {
      this.mouseoverHandle = fuc;
    },
    onMouseout(fuc) {
      this.mouseoutHandle = fuc;
    },
    inPath(x, y) {
      this.drawPath(this.c);
      return this.c.isPointInPath(x, y);
    },
    update(c) {
      c.save()
      this.drawPath(c);
      c.fillStyle = this.fillStyle;
      c.strokeStyle = this.strokeStyle;
      c.lineWidth = this.lineWidth;
      c.stroke();
      c.globalAlpha = this.globalAlpha;
      c.fill();
      c.restore();
    },
  });
  return that
};

export default Shape;