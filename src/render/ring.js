/* eslint-disable no-multi-assign */
/* eslint-disable no-continue */
/* eslint-disable no-mixed-operators */
/* eslint-disable operator-assignment */

import Shape from './shape.js'
import { 
  sin, cos,l,dpr
} from '../common/index.js'

import M2 from '../common/matrix2d.js'
import Vec2 from '../common/vector.js'
import Line from './line.js'

const intersectionPoint = (e) => {
  // p0 + v1*t1 = p2 + v2*t2

  // e[0].x1 + e[0].dir.x * t1 = e[1].x1 + e[1].dir.x * t2;
  // e[0].y1 + e[0].dir.y * t1 = e[1].y1 + e[1].dir.y * t2;

  // e[0].dir.x * t1 - e[1].dir.x * t2 = e[1].x1 - e[0].x1;
  // e[0].dir.y * t1 - e[1].dir.y * t2 = e[1].y1 - e[0].y1;

  //  a b          t1          e
  //  c d          t2          f
  let mat = {
    a: e[0].dir.x,
    b: -e[1].dir.x,
    c: e[0].dir.y,
    d: -e[1].dir.y,

    e: e[1].x1 - e[0].x1,
    f: e[1].y1 - e[0].y1
  };

  //Dx
  let DxMat = {
    ...mat,
    a: mat.e,
    c: mat.f
  };
  //Dy
  let DyMat = {
    ...mat,
    b: mat.e,
    d: mat.f
  };

  //D ad-cb
  let D = mat.a * mat.d - mat.c * mat.b;
  let Dx = DxMat.a * DxMat.d - DxMat.c * DxMat.b;
  let Dy = DyMat.a * DyMat.d - DyMat.c * DyMat.b;
  let intersect = {
    x: 0,
    y: 0,
    intersectionExist:null
  };
  // 平行无解
  let msg = ''
  if (D === 0) {
    msg = 'no solution'
  } else {
    // 直线相交
    let [t1, t2] = [Dx / D, Dy / D];

    msg = 'intersection!'
    intersect = {
      t1,
      t2,
      x: e[0].x1 + e[0].dir.x * t1,
      y: e[0].y1 + e[0].dir.y * t1,
      intersectionExist:true
    };
    
  }

  return {
    ...intersect,
    msg
  };
};


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

      this.rotate = 0
      this.scale = 1
      this.originX = 0
      this.originY = 0

      this.x = 0
      this.y = 0;

      this.mat = new M2()

      Object.defineProperties(this,{
        edge1:{
          get(){ return new Vec2(Math.cos(this.startRadian),Math.sin(this.startRadian)) }
        },
        edge2:{
          get(){ return new Vec2(Math.cos(this.endRadian),Math.sin(this.endRadian)) }
        },
        normal:{
          get(){ 
            return this.innerRadius === 0 ? new Vec2(0,0):this.edge1.rotateAround(new Vec2(0,0),(this.endRadian-this.startRadian)*.5) 
          }
        },
        po:{
          get(){ return new Vec2(this.x,this.y)}
        },
        p0:{
          get(){return this.po.add( this.edge1.multiplyScalar(this.innerRadius)  )}
        },
        p1:{
          get(){return this.po.add( this.edge1.multiplyScalar(this.outerRadius)  )}
        },
        p2:{
          get(){return this.po.add( this.edge2.multiplyScalar(this.outerRadius)  )}
        },
        p3:{
          get(){return this.po.add( this.edge2.multiplyScalar(this.innerRadius)  )}
        },
        p4:{
          get(){return this.po.add(
            this.normal.multiplyScalar(this.innerRadius+(this.outerRadius-this.innerRadius)*.5  )
          )}
        },
      })

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
          y: sin(radian)
        },
        tangent:{
          x: -sin(radian),
          y: cos(radian),
        }
      };
    },
    inPath(x,y){

      if(this.innerRadius === 0){
        return new Vec2(x-this.x,y-this.y).length()<this.outerRadius
      }

      const helpAxis = Line({
        x1:this.p1.x,
        y1:this.p1.y,
        x2:this.p2.x,
        y2:this.p2.y
      })
      const mouseAxis = Line({
        x1:x,
        y1:y,
        x2:this.x,
        y2:this.y
      })

      let centerAxisLen = new Vec2(x-this.x,y-this.y).length()
      if(centerAxisLen<this.outerRadius && centerAxisLen>this.innerRadius){

        let interactive = intersectionPoint([
          helpAxis, mouseAxis
        ])

        if(interactive.intersectionExist){
          if(Math.abs(this.endRadian-this.startRadian)>Math.PI){
              if(interactive.t1>=0&&interactive.t1<=1&&interactive.t2<1){
              }else{
                return true 
              }
          }else{
            if(interactive.intersectionExist){
              if(interactive.t1>=0&&interactive.t1<=1&&interactive.t2<1){
                return true
              }
            }
          }
        }
      }

      return false
    },
    drawPath(c) {
      const {
        innerRadius: ir,
        outerRadius: or,
        startRadian: sr,
        endRadian: er,
      } = this;

      c.beginPath();

      {
        this.mat = 
        new M2().scaling(dpr,dpr)
        .multiply(new M2().translation(this.x,this.y))
        .multiply(new M2().rotation(this.rotate))
        .multiply(new M2().scaling(this.scale))
        .multiply(new M2().translation(-this.originX,-this.originY))
        c.setTransform(...this.mat.elements)
      }
      
      c.arc(0,0, or, sr, er);

      c.arc(
        0, // 圆心x
        0, // 圆心y
        ir, // 圆弧的半径
        er, // 圆弧的开始弧度
        sr, // 圆弧的结束弧度
        true, // 逆时针绘制
      );
      c.closePath();
    },
  });
  return that.init();
};

export default Ring;