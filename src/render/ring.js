/* eslint-disable no-multi-assign */
/* eslint-disable no-continue */
/* eslint-disable no-mixed-operators */
/* eslint-disable operator-assignment */

import Shape from './shape.js'
import { 
  sin, cos,l,
} from '../common/index.js'

const Ring = ({
  innerRadius, outerRadius, startRadian, endRadian,
}) => {
  const that = Shape()
  Object.assign(that,{
    name: 'ring',
    fillStyle: 'black',
    globalAlpha: 1,
    x: 0,
    y: 0,
    z:0,
    init() {
      this.innerRadius = innerRadius;
      this.outerRadius = outerRadius;
      this.startRadian = startRadian;
      this.endRadian = endRadian;
      return this;
    },
    getCenterPo() {
      const radian = l(this.startRadian, this.endRadian, 0.5);
      const radius = l(this.innerRadius, this.outerRadius, 0.5);
      return {
        x: this.innerRadius === 0 ? this.x : cos(radian) * radius + this.x,
        y: this.innerRadius === 0 ? this.y : sin(radian) * radius + this.y,
      };
    },
    getMiddleOfEdge() {
      const radian = l(this.startRadian, this.endRadian, 0.5);
      const radius = this.outerRadius;
      return {
        x: cos(radian) * radius + this.x,
        y: sin(radian) * radius + this.y,
        normalize: {
          x: cos(radian),
          y: sin(radian),
        },
        tangent:{
          // x:-sin(radian),
          // y:cos(radian)
          x:-sin(radian),
          y:cos(radian)
        }
      };
    },
    drawPath(c) {
      const {
        innerRadius: ir,
        outerRadius: or,
        startRadian: sr,
        endRadian: er,
      } = this;

      const [cx, cy] = [this.x, this.y];

      c.beginPath();

      c.moveTo(cos(sr) * ir + cx, sin(sr) * ir + cy);
      c.lineTo(cos(sr) * or + cx, sin(sr) * or + cy);

      c.arc(cx, cy, or, sr, er);

      c.lineTo(
        cos(er) * ir + cx, // 圆弧起点x
        sin(er) * ir + cy, // 圆弧起点y
      );

      c.arc(
        cx, // 圆心x
        cy, // 圆心y
        ir, // 圆弧的半径
        er, // 圆弧的开始弧度
        sr, // 圆弧的结束弧度
        true, // 逆时针绘制
      );
      c.closePath();

      // c.arc(200,200,100,0,Math.PI*2)
    },
  });
  return that.init();
};

export default Ring;