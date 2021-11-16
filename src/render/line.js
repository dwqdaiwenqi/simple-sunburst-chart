import Group from './group.js'

const Line = ({
  x1, y1, x2, y2,
}) => {
  const that = Group()
  Object.assign(that,{
    name: 'line',
    lineWidth: 1,
    strokeStyle: 'black',
    init() {
      this.x1 = x1;
      this.x2 = x2;
      this.y1 = y1;
      this.y2 = y2;
      return this;
    },
    update(c) {
      c.save();
      c.lineWidth = this.lineWidth;
      c.strokeStyle = this.strokeStyle;
      c.beginPath();
      c.moveTo(this.x1, this.y1);
      c.lineTo(this.x2, this.y2);
      c.closePath();
      c.stroke();
      c.restore();
    },
  });
  return that.init();
};

export default Line