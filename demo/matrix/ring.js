import M2 from './m2.js'

export default class Ring{
  constructor({
    innerRadius,
    outerRadius, 
    startRadian, 
    endRadian,
    x,
    y,
    color,
    originX,
    originY
  }){
    this.x = x??0
    this.y = y??0
    this.innerRadius = innerRadius??0
    this.outerRadius = outerRadius??30
    this.startRadian = startRadian??0
    this.endRadian = endRadian??Math.PI*2
    this.color = color ?? 'black'
    this.rotate = 0
    this.scale = 1
    this.originX = originX ?? 0
    this.originY = originY ?? 0
    
    this.mat = new M2()
  }
  render(c){

    c.save()

     c.strokeStyle = this.color

    const {
      innerRadius: ir,
      outerRadius: or,
      startRadian: sr,
      endRadian: er,
    } = this;


    c.beginPath();

    {
      let transMat = new M2().translation(this.x,this.y)
      let rotMat = new M2().rotation(this.rotate)
      let scaleMat = new M2().scaling(this.scale)
      let originMat = new M2().translation(-this.originX,-this.originY)

      let mat = transMat
        .multiply(rotMat)
        .multiply(scaleMat)
        .multiply(originMat)
      
      this.mat = mat

      c.setTransform(...this.mat.elements)
    }


    c.arc(0, 0, or, sr, er);

    c.arc(
      0, // 圆心x
      0, // 圆心y
      ir, // 圆弧的半径
      er, // 圆弧的开始弧度
      sr, // 圆弧的结束弧度
      true, // 逆时针绘制
    );

    c.closePath();

    c.stroke()

    c.restore()

  }
}