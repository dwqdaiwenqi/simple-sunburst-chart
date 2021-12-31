
// ///////////


// import Rect from './rect.js'
// import Ring from './ring.js'

// let $c = document.querySelector('#c')
// let c = $c.getContext('2d')

// const rects = []

// // rects[0] = new Rect({
// //   x:200,
// //   y:200,
// //   width:100,
// //   height:50,
// //   color:'blue',
// //   // originX:0,
// //   // originY:50*.5
// // })


// // rects[1] = new Rect({
// //   x:rects[0].x,
// //   y:rects[0].y,
// //   width:5,
// //   height:5,
// //   color:'red',
// // })

// // rects[2] = new Rect({
// //   x:0,
// //   y:0,
// //   width:rects[0].width*.5,
// //   height:rects[0].height*.5,
// //   color:'teal',
// //   originX:0,
// //   originY:0
// // })

// // rects[2].parent = rects[0]

// const rings = []

// rings[0] = new Ring({
//   innerRadius:30,
//   outerRadius:60, 
//   startRadian:0, 
//   endRadian:Math.PI*1,
//   x:200,
//   y:200
// })

// rings[1] = new Ring({
//   innerRadius:0,
//   outerRadius:5, 
//   startRadian:0, 
//   endRadian:Math.PI*2,
//   x:200,
//   y:200
// })


// let render = ()=>{
//   rects.forEach(o=>{
//     o.render(c)
//   })
//   rings.forEach(o=>{
//     o.render(c)
//   })
// }

// onclick = ()=>{

//   c.clearRect(0,0,$c.width,$c.height)

//   // rects[0].rotate += .05
//   // rects[0].scale += .05
//   rings[0].scale += .05
//   render()
// }

// render()

// requestAnimationFrame(function callee(){
//   requestAnimationFrame(callee)

  
// })




///////////////
import Vec2 from './vector.js'
import intersectionPoint from './intersectionPoint.js';
const [cos,sin] = [Math.cos,Math.sin]

class Ring {
  constructor({
    innerRadius,
    outerRadius,
    startRadian,
    endRadian
  }){
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.startRadian = startRadian;
    this.endRadian = endRadian;
    this.x = 0
    this.y = 0

    Object.defineProperties(this,{
      po:{
        get(){
          return new Vec2(this.x,this.y)
        }
      },
      pu1:{
        get(){
          return new Vec2(cos(this.startRadian),sin(this.startRadian))
        }
      },
      pu2:{
        get(){
          return new Vec2(cos(this.endRadian),sin(this.endRadian))
        }
      },
      p0:{
        get(){
          return this.po.add((this.pu1.multiplyScalar(this.innerRadius)))
        }
      },
      p1:{
        get(){
          return this.po.add(this.pu1.multiplyScalar(this.outerRadius))
        }
      },
      p2:{
        get(){
          return this.po.add(this.pu2.multiplyScalar(this.outerRadius))
        }
      },
      p3:{
        get(){
          return this.po.add(this.pu2.multiplyScalar(this.innerRadius))
        }
      },
      // helpAxis:{
      //   get(){
      //     return this.p1.sub(this.this.p2)
      //   }
      // }
    })

  }
  render(){
    const {
      innerRadius: ir,
      outerRadius: or,
      startRadian: sr,
      endRadian: er,
    } = this;

    const [cx, cy] = [this.x, this.y];


    c.save()

    c.beginPath();

    // c.moveTo(cos(sr) * ir + cx, sin(sr) * ir + cy);
    // c.lineTo(cos(sr) * or + cx, sin(sr) * or + cy);

    c.arc(cx, cy, or, sr, er);

    // c.lineTo(
    //   cos(er) * ir + cx, // 圆弧起点x
    //   sin(er) * ir + cy, // 圆弧起点y
    // );

    c.arc(
      cx, // 圆心x
      cy, // 圆心y
      ir, // 圆弧的半径
      er, // 圆弧的开始弧度
      sr, // 圆弧的结束弧度
      true, // 逆时针绘制
    );
    c.closePath();

    c.stroke()

    c.restore()

    // console.log('cx, cy, or, sr, er',cx, cy, or, sr, er)


  }
}

const Line = ({
  x1, y1, x2, y2,
}) => {
  const that ={}
  Object.assign(that,{
    name: 'line',
    lineWidth: 1,
    strokeStyle: 'black',
    z:0,
    init() {
      this.x1 = x1;
      this.x2 = x2;
      this.y1 = y1;
      this.y2 = y2;
      Object.defineProperties(this,{
        dir:{
          get(){
            // return new Vec2(this.x2-this.x1,this.y2-this.y1).normalize()
            return new Vec2(this.x2-this.x1,this.y2-this.y1)

          }
        }
      })
      return this;
    },
    render(c) {
      c.save();
      c.lineWidth = this.lineWidth;
      c.strokeStyle = this.strokeStyle;
      c.beginPath();
      c.moveTo(this.x1, this.y1);
      c.lineTo(this.x2, this.y2);
      c.closePath();
      c.stroke();
      c.restore();

      // console.log(this.x1, this.y1,this.x2, this.y2)
    },
  });
  return that.init();
};



let $c = document.querySelector('#c')
let c = $c.getContext('2d')

let interactiveDot = new Ring({
  innerRadius:0,
  outerRadius:5,
  startRadian:0,
  endRadian:2*Math.PI
})
interactiveDot.x = 0
interactiveDot.y = 0

let ring = new Ring({
  innerRadius:30,
  outerRadius:80,
  startRadian:0,
  endRadian:Math.PI*.6
})
ring.x = 150
ring.y = 150

ring.helpAxis = Line({
  x1:ring.p2.x,
  y1:ring.p2.y,
  x2:ring.p1.x,
  y2:ring.p1.y
})

let line1 = Line({x1:0,y1:0,x2:0,y2:0})

let render = ()=>{
  // rects.forEach(o=>{
  //   o.render(c)
  // })
  // rings.forEach(o=>{
  //   o.render(c)
  // })

  ring.render(c)

  line1.render(c)

  ring.helpAxis.render(c)

  interactiveDot.render(c)
}

render()

let i = 0

$c.onmousemove = (e)=>{

  c.clearRect(0,0,$c.width,$c.height)

  const [x,y] = [e.pageX,e.pageY]

  line1.x1 = ring.x
  line1.y1 = ring.y

  line1.x2 = x
  line1.y2 = y

  let interactive = intersectionPoint([
    ring.helpAxis,line1
  ])

  let centerAxisLen = new Vec2(line1.x2-ring.x,line1.y2-ring.y).length()

  if(centerAxisLen<ring.outerRadius && centerAxisLen>ring.innerRadius){
    if(Math.abs(ring.endRadian-ring.startRadian)>Math.PI){
      if(interactive.intersectionExist){
        if(interactive.t1>=0&&interactive.t1<=1){
        }else{
          document.querySelector('#log-placeholder').textContent = '钝角:'+(i++)
        }
      }else{
        // console.log('钝角...')
      }
    }else{
      if(interactive.intersectionExist){
        if(interactive.t1>=0&&interactive.t1<=1){
          interactiveDot.x = interactive.x
          interactiveDot.y = interactive.y
          // console.log('锐角 interactive:',interactive)
          document.querySelector('#log-placeholder').textContent = '锐角:'+(i++)
        }
      }
    }

  }

  render()

}

requestAnimationFrame(function callee(){
  requestAnimationFrame(callee)

  
})
