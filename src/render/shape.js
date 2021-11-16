import Group from './group.js'

const Shape = () => {
  const that = Group()
  Object.assign(that,{
    shape: true,
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
      this.drawPath(c);
      c.globalAlpha = this.globalAlpha;
      c.fill();
      c.restore();
    },
  });
  return that
};

export default Shape;