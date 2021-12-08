/* eslint-disable no-multi-assign */
/* eslint-disable no-continue */
/* eslint-disable no-mixed-operators */
/* eslint-disable operator-assignment */
import Shape from './shape.js'

const Circle = ({
  radius
}) => {
  const that = Shape()
  Object.assign(that,{
    name: 'circle',
    x: 0,
    y: 0,
    radius,
    strokeStyle:'white',
    fillStyle: 'black',
    globalAlpha: 1,
    lineWidth:1,
    init() {
      return this;
    },
    drawPath(c) {
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      c.closePath();
    },
  });
  return that.init();
};

export default Circle;